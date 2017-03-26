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

function getActiveLayerData() {
    return JSON.stringify({
        isText: (activeDocument.activeLayer.kind == LayerKind.TEXT),
        id: activeDocument.activeLayer.id
    });
}

function setActiveLayerText(text) {
    if (!text) {
        return 'empty';
    } else if (activeDocument.activeLayer.kind != LayerKind.TEXT) {
        return 'layer';
	} else {
        activeDocument.activeLayer.textItem.contents = text;
		return '';
	}
}