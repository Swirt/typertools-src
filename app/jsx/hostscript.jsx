function getActiveLayerData() {
    return JSON.stringify({
        isText: (activeDocument.activeLayer.kind == LayerKind.TEXT),
        id: activeDocument.activeLayer.id
    });
}

function setActiveLayerText(text) {
	if (activeDocument.activeLayer.kind != LayerKind.TEXT) {
		return true;
	} else {
		activeDocument.activeLayer.textItem.content = text;
		return false;
	}
}