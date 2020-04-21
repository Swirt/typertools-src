/*
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/host/jam/jamActions-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/host/jam/jamEngine-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/host/jam/jamHelpers-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/host/jam/jamJSON-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/host/jam/jamText-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/host/jam/jamStyles-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/host/jam/jamUtils-min.jsxinc');
*/


function nativeAlert(data) {
    alert(data.text, data.title, data.isError);
}

function nativeConfirm(data) {
    var result = confirm(data.text, false, data.title);
    return result ? '1' : '';
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
    if (!documents.length) {
        return '';
    }
    return jamJSON.stringify({
        isText: (activeDocument.activeLayer.kind == LayerKind.TEXT),
        id: activeDocument.activeLayer.id,
        docId: activeDocument.id
    });
}

function getActiveLayerText() {
    if (!documents.length) {
        return '';
    } else if (activeDocument.activeLayer.kind != LayerKind.TEXT) {
        return '';
    }
    return jamJSON.stringify({
        text: jamText.getLayerText(),
        layer: jamStyles.getLayerStyle()
    });
}

function setActiveLayerText(data) {
    if (!documents.length) {
        return 'doc';
    } else if (activeDocument.activeLayer.kind != LayerKind.TEXT) {
        return 'layer';
    }
    if (data.text) {
        const newText = {
            "layerText": {
                "textKey": data.text
            }
        }
        jamText.setLayerText(newText);
    }
    if (data.style) {
        if (data.style.layer) {
            var currentLayerStyle = jamStyles.getLayerStyle();
            if (currentLayerStyle.layerEffects) {
                jamStyles.setLayerStyle(null);
            }
            jamStyles.setLayerStyle(data.style.layer);
        }
        if (data.style.text) {
            if (data.text) {
                data.style.text.layerText.textStyleRange[0].to = data.text.length;
                data.style.text.layerText.paragraphStyleRange[0].to = data.text.length;
            }
            jamText.setLayerText(data.style.text);
        }
    }
    return '';
}