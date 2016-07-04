/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {
    'use strict';

    var csInterface = new CSInterface();
    
    function init() {
                
        themeManager.init();
                
        $("#btn_test").click(function () {
            csInterface.evalScript('sayHello()');
        });

	    var event = new CSEvent();
	    event.type = "com.adobe.PhotoshopRegisterEvent";
	    event.scope = "APPLICATION";
	    event.extensionId = csInterface.getExtensionID();
	    //event.data = "1668247673, 1885434740, 1668641824";
	    csInterface.dispatchEvent(event);
	    csInterface.addEventListener("PhotoshopCallback", function(e, x) {
		    console.dir(e);
		    console.dir(x);
	    });
    }
        
    init();

}());
    
