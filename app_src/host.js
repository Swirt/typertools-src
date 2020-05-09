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
        data.style.textProps.layerText.textKey = data.text.replace(/\n+/gi, '');
        data.style.textProps.layerText.textStyleRange[0].to = data.text.length;
        data.style.textProps.layerText.paragraphStyleRange[0].to = data.text.length;
        jamText.setLayerText(data.style.textProps);
    } else if (data.text) {
        var style = {
            "layerText": {
                "textKey": data.text.replace(/\n+/gi, '')
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


function _noSelection() {
    try {
        var bounds = activeDocument.selection.bounds;
        if (!bounds) {
            return 'noSelection';
        }
        var width = Number(bounds[2]) - Number(bounds[0]);
        var height = Number(bounds[3]) - Number(bounds[1]);
        if (width * height < 200) {
            return 'smallSelection';
        } else {
            return '';
        }
    } catch (error) {
        return 'noSelection';
    }
}

function _getSelectionRegion(fixed) {
    try {
        if (!fixed) activeDocument.selection.smooth(5);
        var bounds = activeDocument.selection.bounds;
        var width = Number(bounds[2]) - Number(bounds[0]);
        var height = Number(bounds[3]) - Number(bounds[1]);
        var region = [
            [Number(bounds[0]), Number(bounds[1])],
            [Number(bounds[0]) + width, Number(bounds[1])],
            [Number(bounds[0]) + width, Number(bounds[1]) + height],
            [Number(bounds[0]), Number(bounds[1]) + height],
            [Number(bounds[0]), Number(bounds[1])]
        ];
        region.width = width;
        region.height = height;
        return region;
    } catch (error) {
        return '';
    }
}

function _fitTextLayerSizeToSelection(fixed) {
    var region = _getSelectionRegion(fixed);
    var textItem = activeDocument.activeLayer.textItem;
    if (textItem.kind !== TextType.PARAGRAPHTEXT) {
        textItem.kind = TextType.PARAGRAPHTEXT;
    }
    textItem.width = region.width * 0.8;
    textItem.height = region.height * 10;
    var textProps = jamText.getLayerText();
    textItem.height = textProps.layerText.boundingBox.bottom;
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

function alignTextLayerToSelection() {
    if (!documents.length) {
        return 'doc';
    } else if (activeDocument.activeLayer.kind != LayerKind.TEXT) {
        return 'layer';
    } else if (_noSelection()) {
        return _noSelection();
    }
    _fitTextLayerSizeToSelection();
    _alignToSelectionAction();
    return '';
}


function _createTextLayerAction() {
    var ref = new ActionReference();
    var desc = new ActionDescriptor();
    var idMk = charIDToTypeID( "Mk  " );
    var idnull = charIDToTypeID( "null" );
    var idLyr = charIDToTypeID( "Lyr " );
    var idLyrI = charIDToTypeID( "LyrI" );
    ref.putClass( idLyr );
    desc.putReference( idnull, ref );
    desc.putInteger( idLyrI, 3 );
    executeAction( idMk, desc, DialogModes.NO );
    // convert to text
    var newLayer = activeDocument.activeLayer;
    var region = _getSelectionRegion();
    newLayer.kind = LayerKind.TEXT;
    if (region) activeDocument.selection.select(region);
    return newLayer;
}

function createTextLayerInSelection(data) {
    if (!documents.length) {
        return 'doc';
    } else if (_noSelection()) {
        return _noSelection();
    }
    _createTextLayerAction();
    setActiveLayerText(data);
    _fitTextLayerSizeToSelection(true);
    _alignToSelectionAction();
    return '';
}