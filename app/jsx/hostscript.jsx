function getActiveLayerData() {
    return JSON.stringify({
        text: (activeDocument.activeLayer.kind == LayerKind.TEXT),
        id: activeDocument.activeLayer.id
    });
}
