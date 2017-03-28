(function ($) {
    'use strict';
	
    var csInterface = new CSInterface();
    
    var loadJSX = function(fileName) {
        var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + '/app/jsx/';
        csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
    }
	var getActiveLayerData = function(callback) {
		csInterface.evalScript('getActiveLayerData()', function(data) {
			callback(JSON.parse(data));
		});
	};
	var setActiveLayerText = function(text, callback) {
		csInterface.evalScript('setActiveLayerText("' + text + '")', function(error) {
			callback(error);
		});
	};
    
    var init = function() {
		
        themeManager.init();
        loadJSX('json2.js');
        loadJSX('switchType.jsx');
				
		var active = false;
		var scriptArr = [];
		
        var body = $('BODY');
        var header = $('.tool-header');
		var toggleBtn = $('#tool-toggle');
		var currentText = $('#tool-current-line');
        var prevLineBtn = $('#tool-prev-line');
		var nextLineBtn = $('#tool-next-line');
		var inputCurrentBtn = $('#tool-insert-current');
		var errorCont = $('#tool-error');
		var errorText = $('#tool-error SPAN');
		var textCont = $('#tool-text');
		var textArea = $('#tool-textarea');
		var textListCont = $('.tool-text-list');
        var originRow = $('.tool-hidden-origins .tool-line');
		
		
		var errorTimer = 0;
		var errorShowTime = 3000;
		var showError = function(text) {
			errorCont.hide();
			errorText.text(text);
			clearTimeout(errorTimer);
			errorCont.fadeIn(function() {
				errorTimer = setTimeout(function() {
					errorCont.fadeOut();
				}, errorShowTime);
			});
		};
        
		
		var currentLine = 0;
		var scrollToCurrent = function() {
			var newTop = $('.tool-line.m-current').position().top - 40;
			var currentTop = textCont.scrollTop();
			var height = textCont.outerHeight();
			if (newTop < currentTop || newTop > (currentTop + height - 70)) {
				textCont.scrollTop(newTop);
			}
		};
        var checkCurrent = function() {
            if (scriptArr.length) {
                body.removeClass('empty-text');
                toggleBtn.prop('disabled', false);
                if (currentLine < 0) {
                    currentLine = 0;
                } else if (currentLine >= scriptArr.length) {
                    currentLine = scriptArr.length - 1;
					if (active) toggleBtn.click();
                }
				if (currentLine === 0) {
					prevLineBtn.prop('disabled', true);
				} else {
					prevLineBtn.prop('disabled', false);
				}
				if (currentLine === scriptArr.length - 1) {
					nextLineBtn.prop('disabled', true);
				} else {
					nextLineBtn.prop('disabled', false);
				}
                currentText.text(scriptArr[currentLine]);
                $('.line-' + currentLine, textListCont).addClass('m-current').siblings().removeClass('m-current');
            } else {
                body.addClass('empty-text');
                toggleBtn.prop('disabled', true);
				prevLineBtn.prop('disabled', true);
				nextLineBtn.prop('disabled', true);
				textListCont.empty();
                currentText.text('');
                currentLine = 0;
            }
        };
        prevLineBtn.on('click', function() {
            if (this.disabled) return false;
            currentLine -= 1;
            checkCurrent();
			scrollToCurrent();
        });
        nextLineBtn.on('click', function() {
            if (this.disabled) return false;
            currentLine += 1;
            checkCurrent();
			scrollToCurrent();
        });
		currentText.on('click', function() {
			scrollToCurrent();
		});
        checkCurrent();
		
		
		var checkTimer = 0;
        var checkInterval = 400;
		var activeLayerId = null;
		var activeDocumentId = null;
		var checkLayerChange = function() {
			if (!active) return false;
			checkTimer = setTimeout(function() {
				getActiveLayerData(function(layer) {
					if (layer.docId !== activeDocumentId) {
						activeDocumentId = layer.docId;
						if (layer.isText) {
							activeLayerId = layer.id;
						}
						checkLayerChange();
					} else {
						if (layer.isText && layer.id !== activeLayerId) {
							activeLayerId = layer.id;
							setActiveLayerText(scriptArr[currentLine], function(error) {
								if (!error) {
									currentLine += 1;
									checkCurrent();
									scrollToCurrent();
								}
								checkLayerChange();
							});
						} else {
							checkLayerChange();
						}
					}
				});
			}, checkInterval);
		};
		toggleBtn.on('click', function() {
			if (this.disabled) return false;
			active = !active;
			if (active) {
				body.addClass('tool-active');
				toggleBtn.text(toggleBtn.data('on'));
				getActiveLayerData(function(layer) {
					activeDocumentId = layer.docId;
					if (layer.isText) {
						activeLayerId = layer.id;
					}
					checkLayerChange();
				});
			} else {
				clearTimeout(checkTimer);
				toggleBtn.text(toggleBtn.data('off'));
				body.removeClass('tool-active');
				activeLayerId = null;
			}
		});
		inputCurrentBtn.on('click', function() {
			if (this.disabled) return false;
			setActiveLayerText(scriptArr[currentLine], function(error) {
				if (error) {
                    if (error === 'layer') showError('Выбранный слой не является текстовым');
					else if (error === 'empty') showError('Нет текста для вставки');
				} else {
					currentLine += 1;
					checkCurrent();
					scrollToCurrent();
				}
			});
		});
		
		
        var makeList = function(list) {
            var i = 0;
			scriptArr = [];
            textListCont.empty();
            list.forEach(function(line) {
                var row = originRow.clone();
                if (line.replace(/[\s]+/g, '')) {
                    if (i === currentLine) {
                        row.addClass('m-current');
                    }
                    row.data('index', i).addClass('line-' + i);
                    $('.tool-line-num', row).text(++i);
                    $('.tool-line-text', row).text(line);
					scriptArr.push(line);
                } else {
                    $('.tool-line-select', row).remove();
                    $('.tool-line-text', row).text(' ');
                    $('.tool-line-num', row).text('×');
                    row.removeClass('m-notempty');
                }
                textListCont.append(row);
            });
			$(window).resize();
            checkCurrent();
        };        
        textArea.on('input', function(e) {
            var list = e.target.value.split('\n');
            makeList(list);
        }).on('focus', function() {
			textCont.addClass('m-focus');
		}).on('blur', function() {
			textCont.removeClass('m-focus');
		});
        textListCont.on('click', '.tool-line-select', function() {
            var row = $(this).closest('.tool-line');
            if (row.hasClass('m-current')) return false;
            currentLine = row.data('index');
            checkCurrent();
        });
		
		
        $(window).resize(function() {
			var height = window.outerHeight - header.outerHeight() - 97;
            textCont.height(height);
			textListCont.css('min-height', height);
			textArea.height(textListCont.height()).scrollTop(0);
        });
    }
	
    init();
	
})(jQuery);