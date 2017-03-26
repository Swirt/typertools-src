(function ($) {
    'use strict';
	
    var csInterface = new CSInterface();
    
    var loadJSX = function(fileName) {
        var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + '/app/jsx/';
        csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
    }
	var getActiveLayerData = function(callback) {
		csInterface.evalScript('getActiveLayerData()', function(res) {
			callback(JSON.parse(res));
		});
	};
	var setActiveLayerText = function(text, callback) {
		csInterface.evalScript('setActiveLayerText("' + text + '")', function(error) {
			callback(error);
		});
	};
    
    function init() {
		
        themeManager.init();
        loadJSX('json2.js');
		
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
			var top = $('.tool-line.m-current').position().top - 40;
			var currentTop = textCont.scrollTop();
			var height = textCont.outerHeight();
			if (top < currentTop || top > (currentTop + height - 70)) {
				textCont.scrollTop(top);
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
                }
                currentText.text(scriptArr[currentLine]);
                $('.tool-text-list .tool-line.m-notempty').eq(currentLine).addClass('m-current').siblings().removeClass('m-current');
            } else {
                body.addClass('empty-text');
                toggleBtn.prop('disabled', true);
				$('.tool-text-list').empty();
                currentText.text('');
                currentLine = 0;
            }
            if (currentLine === 0 || !scriptArr.length) {
                prevLineBtn.prop('disabled', true);
            } else {
                prevLineBtn.prop('disabled', false);
            }
            if (currentLine >= scriptArr.length - 1 || !scriptArr.length) {
                nextLineBtn.prop('disabled', true);
				if (active) toggleBtn.click();
            } else {
                nextLineBtn.prop('disabled', false);
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
		var checkLayerChange = function() {
			if (!active) return false;
			checkTimer = setTimeout(function() {
				getActiveLayerData(function(layer) {
					if (layer.isText && layer.id !== activeLayerId) {
						activeLayerId = layer.id;
						setActiveLayerText(scriptArr[currentLine], function(error) {
							currentLine += 1;
							checkCurrent();
							scrollToCurrent();
						});
					}
					checkLayerChange();
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
					if (layer.isText) {
						activeLayerId = layer.id;
					}
					checkLayerChange();
				});
			} else {
				body.removeClass('tool-active');
				toggleBtn.text(toggleBtn.data('off'));
				clearTimeout(checkTimer);
				activeLayerId = null;
			}
		});
		inputCurrentBtn.on('click', function() {
			if (this.disabled) return false;
			var line = scriptArr[currentLine];
			setActiveLayerText(line, function(error) {
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
                if (line.replace(/[\s\n\r]+/g, '')) {
                    if (i === currentLine) {
                        row.addClass('m-current');
                    }
                    row.data('index', i);
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
			var height = window.outerHeight - header.outerHeight() - 96;
            textCont.height(height);
			textListCont.css('min-height', height);
			textArea.height(textListCont.height()).scrollTop(0);
        });
    }
	
    init();
	
})(jQuery);