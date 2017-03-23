(function () {
    'use strict';
	
    //var csInterface = new CSInterface();
	
	var random = function() {
		return Math.random().toString(36).substr(2, 8);
	};
    
    function init() {
		
        //themeManager.init();
		
		$("#btn_test").click(function () {
            //csInterface.evalScript('sayHello()');
        });
		
		var text = $('#tool-text');
		
		text[0].onpaste = function(e) {
			var el = e.target;
			var textAreaTxt = $(el).text();
			var caretPos = el.selectionStart;
			console.log(window.getSelection().getRangeAt(0).startOffset);
			var pastedText = undefined;
			if (e.clipboardData && e.clipboardData.getData) {
				pastedText = e.clipboardData.getData('text/plain');
			}
			$(el).text(textAreaTxt.substring(0, caretPos) + pastedText + textAreaTxt.substring(caretPos));
			return false;
		};
		
    }
	
    init();
	
})();
    
