function printObj(obj) {
    var data = {};
    for (var i in obj) {
        try {
            data[i] = obj[i] + '';
        } catch(e) {
            data[i] = '***';
        }
    }
    return JSON.stringify(data);
}

function isOldSession() {
	try {
		var descr = app.getCustomOptions('typertools.sessionMark');
		var session = descr.getString(0);
		return 1;
	} catch (e) {
		var descr = new ActionDescriptor();
		descr.putString(0, 'launched');
		app.putCustomOptions('typertools.sessionMark', descr, false);
		return '';
	}
}

function getActiveLayerData() {
    return JSON.stringify({
        isText: (activeDocument.activeLayer.kind == LayerKind.TEXT),
        id: activeDocument.activeLayer.id,
		docId: activeDocument.id
    });
}

function setActiveLayerText(data) {
    if (!data.text) {
        return 'empty';
    } else if (activeDocument.activeLayer.kind != LayerKind.TEXT) {
        return 'layer';
	} else {
        activeDocument.activeLayer.textItem.contents = data.text;
		if (activeDocument.activeLayer.textItem.kind === TextType.PARAGRAPHTEXT) {
			switchToLine();
			switchToBlock();
		} else {
			switchToBlock();
			switchToLine();
		}
		return '';
	}
}