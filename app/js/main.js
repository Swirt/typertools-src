(function ($) {
    'use strict';
	
    //var csInterface = new CSInterface();
    
    function loadJSX (fileName) {
        var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + '/app/jsx/';
        csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
    }
    
    function init() {
		
        //themeManager.init();
        //loadJSX('json2.js');
		
		var getActiveLayerData = function(callback) {
			csInterface.evalScript('getActiveLayerData()', callback);
		};
		var setActiveLayerText = function(text, callback) {
			csInterface.evalScript('setActiveLayerText(' + text + ')', callback);
		};
		
		var active = false;
		var scriptText = '';
		var scriptArr = [];
		var currentIndex = 0;
		var toggleBtn = $('#tool-toggle');
		var inputCurrentBtn = $('#tool-insert-current');
		var prevLineBtn = $('#tool-prev-line');
		var nextLineBtn = $('#tool-next-line');
		var currentLine = $('#tool-current-line');
		var textArea = $('#tool-texarea');
		var marker = $('#tool-current-marker I');
		var clearText = $('#tool-clear-text');
		var CheckInterval = 500;
		var checkTimer = 0;
			
		var errorCont = $('#tool-error');
		var error = $('#tool-error SPAN');
		var errorTime = 3000;
		var errorTimer = 0;
		var showError = function(text) {
			errorCont.hide();
			error.text(text);
			clearTimeout(errorTimer);
			errorCont.fadeIn(function() {
				errorTimer = setTimeout(function() {
					errorCont.fadeOut();
				}, errorTime);
			});
		};
		
		toggleBtn.on('click', function() {
			showError('Выбранный слой не является текстовым');
			active = !active;
			if (active) {
				
			} else {
				
			}
			return false;
		});
		
		inputCurrentBtn.on('click', function() {
			var line = script[currentIndex];
			setActiveLayerText(line.text, function(error) {
				if (error) {
					showError('Выбранный слой не является текстовым');
				}
			});
		});
		
		
		
		
		
        var on = false;
        var timer = 0;
        
		$("#btn_test").click(function () {
            if (on) {
                on = false;
                clearInterval(timer);
            } else {
                on = true;
                timer = setInterval(function() {
                    csInterface.evalScript('getActiveLayerData()', function(res) {
                        console.log(res);
                    });
                }, 500);
            }
        });
		
		var text = $('#tool-text');
		
		text[0].onpaste = function(e) {
			var pastedText = undefined;
			if (e.clipboardData && e.clipboardData.getData) {
				pastedText = e.clipboardData.getData('text/plain');
			}
			if (pastedText) {
				var range = window.getSelection().getRangeAt(0);
				var caretStart = range.startOffset;
				var caretEnd = range.endOffset;
				var el = $(e.target);
				var txt = el.text();
				el.text(txt.substring(0, caretStart) + pastedText + txt.substring(caretEnd));
			}
			return false;
		};
        
        text[0].oninput = function(e) {
			console.log(e.target);
            if (e.keyCode === 13) {
                console.log('enta');
                return false;
            }
        };
		
    }
	
    init();
	
})(jQuery);
    
