(function ($) {
    'use strict';
	
    var csInterface = new CSInterface();
    
    function loadJSX (fileName) {
        var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + '/app/jsx/';
        csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
    }
    
    function init() {
		
        themeManager.init();
        loadJSX('json2.js');
		
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
			var el = $(e.target);
			var content = el.text();
			var caretPos = window.getSelection().getRangeAt(0).startOffset;
			var pastedText = undefined;
			if (e.clipboardData && e.clipboardData.getData) {
				pastedText = e.clipboardData.getData('text/plain');
                el.text(content.substring(0, caretPos) + pastedText + content.substring(caretPos));
			}
			return false;
		};
        
        text[0].onkeypress = function(e) {
            e.preventDefault();
            console.log(e.keyCode);
            if (e.keyCode === 13) {
                console.log('enta');
                return false;
            }
        };
		
    }
	
    init();
	
})(jQuery);
    
