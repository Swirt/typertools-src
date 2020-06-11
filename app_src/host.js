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
        fontNamesArr.push({
            name: app.fonts[i].name,
            postScriptName: app.fonts[i].postScriptName,
            family: app.fonts[i].family,
            style: app.fonts[i].style
        });
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
    } else if (state.metaKey && state.shiftKey) {
        return 'metaShift';
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
        var width = bounds[2].as('px') - bounds[0].as('px');
        var height = bounds[3].as('px') - bounds[1].as('px');
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
        for (var i = 0; i < bounds.length; i++) {
            bounds[i] = bounds[i].as('px');
        }
        var width = bounds[2] - bounds[0];
        var height = bounds[3] - bounds[1];
        var region = [
            [bounds[0], bounds[1]],
            [bounds[0] + width, bounds[1]],
            [bounds[0] + width, bounds[1] + height],
            [bounds[0], bounds[1] + height],
            [bounds[0], bounds[1]]
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
    var factor = _getTransformFactorAction() * (72 / activeDocument.resolution);
    textItem.kind = TextType.PARAGRAPHTEXT;
    textItem.height = (region.height * 5) * factor;
    textItem.width = (region.width * 0.8) * factor;
    var textProps = jamText.getLayerText();
    textItem.height = (textProps.layerText.boundingBox.bottom + 2) * factor;
    return '';
}


function _getTransformFactorAction() {
    var ref = new ActionReference();
    var idLyr = charIDToTypeID( "Lyr " );
    var idOrdn = charIDToTypeID( "Ordn" );
    var idTrgt = charIDToTypeID( "Trgt" );
    var idTextKey = stringIDToTypeID('textKey');
    var idTextStyleRange = stringIDToTypeID('textStyleRange');
    var idTextStyle = stringIDToTypeID('textStyle');
    var idSize = stringIDToTypeID('size');
    var idTransform = stringIDToTypeID('transform');
    var idYy = stringIDToTypeID("yy");
    ref.putEnumerated(idLyr, idOrdn, idTrgt);
    var desc = executeActionGet(ref).getObjectValue(idTextKey);
    var textSize = desc.getList(idTextStyleRange).getObjectValue(0).getObjectValue(idTextStyle).getDouble(idSize);
    if (desc.hasKey(idTransform)) {
        var mFactor = desc.getObjectValue(idTransform).getUnitDoubleValue(idYy);
        return mFactor;
    }  else {
        return 1;
    }
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
    var oldUnits = preferences.rulerUnits;
    preferences.rulerUnits = Units.PIXELS;
    if (!documents.length) {
        return 'doc';
    } else if (activeDocument.activeLayer.kind != LayerKind.TEXT) {
        return 'layer';
    } else if (_noSelection()) {
        return _noSelection();
    }
    _fitTextLayerSizeToSelection();
    _alignToSelectionAction();
    preferences.rulerUnits = oldUnits;
    return '';
}


function _createTextLayerAction() {
    var ref = new ActionReference();
    var desc = new ActionDescriptor();
    var idMk = charIDToTypeID( "Mk  " );
    var idnull = charIDToTypeID( "null" );
    var idLyr = charIDToTypeID( "Lyr " );
    ref.putClass( idLyr );
    desc.putReference( idnull, ref );
    executeAction( idMk, desc, DialogModes.NO );
    // convert to text
    var region = _getSelectionRegion();
    var newLayer = activeDocument.activeLayer;
    newLayer.kind = LayerKind.TEXT;
    activeDocument.selection.select(region);
    return newLayer;
}

function createTextLayerInSelection(data) {
    var oldUnits = preferences.rulerUnits;
    preferences.rulerUnits = Units.PIXELS;
    if (!documents.length) {
        return 'doc';
    } else if (_noSelection()) {
        return _noSelection();
    }
    _createTextLayerAction();
    setActiveLayerText(data);
    _fitTextLayerSizeToSelection(true);
    _alignToSelectionAction();
    preferences.rulerUnits = oldUnits;
    return '';
}