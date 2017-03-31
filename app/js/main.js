(function ($) {
    'use strict';
	
    var csInterface = new CSInterface();
	var path = csInterface.getSystemPath(SystemPath.EXTENSION);
	var storagePath = path + '/app/storage';
	var extensionPath = path + '/app/jsx/';
    
    var loadJSX = function(fileName) {
        csInterface.evalScript('$.evalFile("' + extensionPath + fileName + '")');
    }
	loadJSX('jam/jamEngine-min.jsxinc');
	loadJSX('jam/jamHelpers-min.jsxinc');
	loadJSX('jam/jamJSON-min.jsxinc');
	loadJSX('jam/jamText-min.jsxinc');
	loadJSX('jam/jamUtils-min.jsxinc');
	
	
	var isOldSession = function(callback) {
		csInterface.evalScript('isOldSession()', function(isOld) {
			callback(isOld);
		});
	};	
	
	var readStorage = function() {
		var result = window.cep.fs.readFile(storagePath);
		if (result.err) {
			return {error: result.err};
		} else {
			return {
				error: null,
				data: JSON.parse(result.data)
			};
		}
	};
	var writeToStorage = function(data) {
		var result = window.cep.fs.writeFile(storagePath, JSON.stringify(data));
		if (result.err) {
			return {error: result.err};
		} else {
			return {error: null};
		}
	};	
	
	var getAllLayers = function(callback) {
		csInterface.evalScript('getAllLayers()', function(data) {
			callback(JSON.parse(data));
		});
	};
	var getActiveLayerData = function(callback) {
		csInterface.evalScript('getActiveLayerData()', function(data) {
			callback(JSON.parse(data));
		});
	};
	var setActiveLayerText = function(text, callback) {
		var data = JSON.stringify({text: text || ''});
		csInterface.evalScript('setActiveLayerText(' + data + ')', function(error) {
			callback(error);
		});
	};
	
	
    var init = function() {
		var initialized = false;
		
		themeManager.init();
		
		var active = false;
		var scriptArr = [];
		var scriptTxt = '';
		var currentLine = 0;
		
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
			clearTimeout(errorTimer);
			errorCont.hide();
			errorText.text(text);
			errorCont.fadeIn(function() {
				errorTimer = setTimeout(function() {
					errorCont.fadeOut();
				}, errorShowTime);
			});
		};
        
		
		var scrollToCurrent = function() {
			var current = $('.tool-line.m-current', textListCont);
			if (current.length) {
				var height = textCont.outerHeight();
				var currentTop = textCont.scrollTop();
				var newTop = current.position().top - 40;
				if (newTop < currentTop || newTop > (currentTop + height - 70)) {
					textCont.scrollTop(newTop);
				}
			}
		};
		var saveState = function() {
			writeToStorage({
				line: currentLine,
				content: scriptTxt
			});
		};
		var getState = function() {
			var storage = readStorage();
			if (!storage.error) {
				currentLine = storage.data.line;
				textArea.val(storage.data.content).trigger('input');
				setTimeout(function() {
					scrollToCurrent();
				}, 100);
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
			if (initialized) {
				saveState();
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
		
		
		var allLayers = {};
		var inProcess = false;
		var insertText = function() {
			inProcess = true;
			setActiveLayerText(scriptArr[currentLine], function(error) {
				if (error) {
                    if (error === 'layer') showError('Выбранный слой не является текстовым');
					else if (error === 'empty') showError('Нет текста для вставки');
					else if (error === 'emptyLayer') showError('Слой не должен быть пустым');
					else showError('Неизвестная ошибка');
				} else {
					currentLine += 1;
					checkCurrent();
					scrollToCurrent();
				}
				inProcess = false;
			});
		};
		var updateAllLayers = function() {
			inProcess = true;
			getAllLayers(function(layers) {
				allLayers = layers;
				inProcess = false;
			});
		};
		toggleBtn.on('click', function() {
			if (this.disabled) return false;
			active = !active;
			if (active) {
				body.addClass('tool-active');
				toggleBtn.text(toggleBtn.data('on'));
			} else {
				body.removeClass('tool-active');
				toggleBtn.text(toggleBtn.data('off'));
			}
		});
		inputCurrentBtn.on('click', function() {
			if (this.disabled) return false;
			insertText();
		});
		csInterface.addEventListener('documentEdited', function() {
			if (inProcess) return;
			getActiveLayerData(function(layer) {
				if (allLayers[layer.docId]) {
					var docLayers = allLayers[layer.docId];
					if (!docLayers[layer.id]) {
						if (active && layer.isText) {
							insertText();
						}
						docLayers[layer.id] = 1;
					}
				} else {
					allLayers[layer.docId] = {};
					updateAllLayers();
				}
			});
		});
		updateAllLayers();
		
		
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
			scriptTxt = e.target.value
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
		
		
		isOldSession(function(isOld) {
			if (isOld) {
				getState();
			}
			initialized = true;
		});
    }
	
    init();
	
})(jQuery);