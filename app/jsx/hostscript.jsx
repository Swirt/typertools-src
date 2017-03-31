function printObj(obj) {
    var data = {};
    for (var i in obj) {
        try {
            data[i] = obj[i] + '';
        } catch(e) {
            data[i] = '***';
        }
    }
    return jamJSON.stringify(data);
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

function getAllLayers() {
	var allLayers = {};
	var docsLength = documents.length;
	for (var i = 0; i < docsLength; i++) {
        var doc = documents[i];
		var layersLength = doc.layers.length;
        allLayers[doc.id] = {};
		for (var j = 0; j < layersLength; j++) {
			allLayers[doc.id][doc.layers[j].id] = 1;
		}
    }
	return jamJSON.stringify(allLayers);
}

function getActiveLayerData() {
    return jamJSON.stringify({
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
	} else if (!activeDocument.activeLayer.textItem.contents) {
		return 'emptyLayer';
	} else {
		var newLayerText = {
			"layerText": {
				"textKey": data.text
			}
		}
		jamText.setLayerText(newLayerText);
		return '';
	}
}