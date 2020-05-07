/*
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamActions-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamEngine-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamHelpers-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamJSON-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamText-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamStyles-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamUtils-min.jsxinc');
*/


function nativeAlert(data) {
    if (!data) return '';
    alert(data.text, data.title, data.isError);
}

function nativeConfirm(data) {
    if (!data) return '';
    var result = confirm(data.text, false, data.title);
    return result ? '1' : '';
}

function getUserFonts() {
    var fontNamesArr = [];
    for (var i = 0; i < app.fonts.length; i++) {
        fontNamesArr.push(app.fonts[i].name);
    }
    return jamJSON.stringify({
        fonts: fontNamesArr
    });
}

function getHotkeyPressed() {
    var state = ScriptUI.environment.keyboardState;
    if (state.metaKey && state.ctrlKey) {
        return 'metaCtrl';
    } else if (state.metaKey && state.altKey) {
        return 'metaAlt';
    } else {
        return '';
    }
}


function getActiveLayerText() {
    if (!documents.length) {
        return '';
    } else if (activeDocument.activeLayer.kind != LayerKind.TEXT) {
        return '';
    }
    return jamJSON.stringify({
        textProps: jamText.getLayerText()
    });
}

function setActiveLayerText(data) {
    if (!data) {
        return '';
    } else if (!documents.length) {
        return 'doc';
    } else if (activeDocument.activeLayer.kind != LayerKind.TEXT) {
        return 'layer';
    }
    if (data.text && data.style) {
        data.style.textProps.layerText.textKey = data.text;
        data.style.textProps.layerText.textStyleRange[0].to = data.text.length;
        data.style.textProps.layerText.paragraphStyleRange[0].to = data.text.length;
        jamText.setLayerText(data.style.textProps);
    } else if (data.text) {
        var style = {
            "layerText": {
                "textKey": data.text
            }
        }
        jamText.setLayerText(style);
    } else if (data.style) {
        var text = activeDocument.activeLayer.textItem.contents;
        data.style.textProps.layerText.textStyleRange[0].to = text.length;
        data.style.textProps.layerText.paragraphStyleRange[0].to = text.length;
        jamText.setLayerText(data.style.textProps);
    }
    return '';
}


function _hasSelection() {
    try {
        var bounds = activeDocument.selection.bounds;
        return !!bounds
    } catch (error) {
        return false;
    }
}

function _getSelectionSize() {
    try {
        var bounds = activeDocument.selection.bounds;
        return [Number(bounds[2]) - Number(bounds[0]), Number(bounds[3]) - Number(bounds[1])];
    } catch (error) {
        return '';
    }
}

function _getSelectionRegion() {
    try {
        var bounds = activeDocument.selection.bounds;
        var width = Number(bounds[2]) - Number(bounds[0]);
        var height = Number(bounds[3]) - Number(bounds[1]);
        return [
            [Number(bounds[0]), Number(bounds[1])],
            [Number(bounds[0]) + width, Number(bounds[1])],
            [Number(bounds[0]) + width, Number(bounds[1]) + height],
            [Number(bounds[0]), Number(bounds[1]) + height],
            [Number(bounds[0]), Number(bounds[1])]
        ];
    } catch (error) {
        return '';
    }
}

function _fitTextLayerSizeToSelection() {
    var selection = _getSelectionSize();
    var textItem = activeDocument.activeLayer.textItem;
    textItem.kind = TextType.PARAGRAPHTEXT;
    textItem.width = selection[0] * 0.8;
    textItem.height = selection[1] * 0.8;
    textItem.kind = TextType.POINTTEXT;
    textItem.kind = TextType.PARAGRAPHTEXT;
    textItem.height += parseInt(textItem.size * (0.7 - textItem.verticalScale / 100));
    return '';
}

function _alignToSelectionAction() {
    var ref = new ActionReference();
    var descV = new ActionDescriptor();
    var descH = new ActionDescriptor();
    var idAlgn = charIDToTypeID( "Algn" );
    var idnull = charIDToTypeID( "null" );
    var idLyr = charIDToTypeID( "Lyr " );
    var idOrdn = charIDToTypeID( "Ordn" );
    var idTrgt = charIDToTypeID( "Trgt" );
    var idUsng = charIDToTypeID( "Usng" );
    var idADSt = charIDToTypeID( "ADSt" );
    var idAdCV = charIDToTypeID( "AdCV" );
    var idAdCH = charIDToTypeID( "AdCH" );
    var idalignToCanvas = stringIDToTypeID( "alignToCanvas" );
    ref.putEnumerated( idLyr, idOrdn, idTrgt );
    descV.putReference( idnull, ref );
    descH.putReference( idnull, ref );
    descV.putEnumerated( idUsng, idADSt, idAdCV );
    descH.putEnumerated( idUsng, idADSt, idAdCH );
    descV.putBoolean( idalignToCanvas, false );
    descH.putBoolean( idalignToCanvas, false );
    executeAction( idAlgn, descV, DialogModes.NO );
    executeAction( idAlgn, descH, DialogModes.NO );
    // correct vertical scale
    var textItem = activeDocument.activeLayer.textItem;
    var dY = parseInt(textItem.size * (textItem.verticalScale / 100 - 1) * 0.6);
    if (dY) activeDocument.activeLayer.translate(0, dY);
    return '';
}

function alignTextLayerToSelection(checked) {
    if (!checked) {
        if (!documents.length) {
            return 'doc';
        } else if (activeDocument.activeLayer.kind != LayerKind.TEXT) {
            return 'layer';
        } else if (!_hasSelection()) {
            return 'selection';
        }
    }
    _fitTextLayerSizeToSelection();
    _alignToSelectionAction();
    return '';
}

function createTextLayerInSelection(textAndStyle) {
    if (!documents.length) {
        return 'doc';
    }
    var region = _getSelectionRegion();
    if (!region) {
        return 'selection';
    }
    var current = activeDocument.activeLayer;
    var newLayer = activeDocument.artLayers.add();
    if (current.typename === 'LayerSet') {
        newLayer.move(current, ElementPlacement.INSIDE);
    } else {
        newLayer.moveBefore(current);
    }
    newLayer.kind = LayerKind.TEXT;
    activeDocument.selection.select(region);
    setActiveLayerText(textAndStyle);
    alignTextLayerToSelection(true);
    return '';
}