/*
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/jam/jamActions-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/jam/jamEngine-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/jam/jamHelpers-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/jam/jamJSON-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/jam/jamText-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/jam/jamStyles-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/jam/jamUtils-min.jsxinc');
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
        style: jamText.getLayerText()
    });
}

function setActiveLayerText(data) {
    if (!documents.length) {
        return 'doc';
    } else if (activeDocument.activeLayer.kind != LayerKind.TEXT) {
        return 'layer';
    }
    if (data.text && data.style) {
        data.style.layerText.textKey = data.text;
        data.style.layerText.textStyleRange[0].to = data.text.length;
        data.style.layerText.paragraphStyleRange[0].to = data.text.length;
        jamText.setLayerText(data.style);
    } else if (data.text) {
        const style = {
            "layerText": {
                "textKey": data.text
            }
        }
        jamText.setLayerText(style);
    } else if (data.style) {
        jamText.setLayerText(data.style);
    }
    return '';
}