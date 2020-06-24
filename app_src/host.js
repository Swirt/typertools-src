/*
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamActions-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamEngine-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamHelpers-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamJSON-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamText-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamStyles-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamUtils-min.jsxinc');
*/

/* globals app, documents, activeDocument, ScriptUI, DialogModes, LayerKind, ActionReference, ActionDescriptor, executeAction, executeActionGet, jamEngine, jamJSON, jamText */


var charID = {
    Bottom: 1114926957, // 'Btom'
    By: 1115234336, // 'By  '
    Channel: 1130917484, // 'Chnl'
    Contract: 1131312227, // 'Cntc'
    Document: 1147366766, // 'Dcmn'
    Expand: 1165521006, // 'Expn'
    FrameSelect: 1718838636, // 'fsel'
    Horizontal: 1215461998, // 'Hrzn'
    Layer: 1283027488, // 'Lyr '
    Left: 1281713780, // 'Left'
    Move: 1836021349, // 'move'
    None: 1315925605, // 'None'
    Null: 1853189228, // 'null'
    Offset: 1332114292, // 'Ofst'
    Ordinal: 1332896878, // 'Ordn'
    PixelUnit : 592476268, // '#Pxl'
    Point: 1349415968, // 'Pnt '
    Property: 1349677170, // 'Prpr'
    Right: 1382508660, // 'Rght'
    Set: 1936028772, // 'setd'
    Target: 1416783732, // 'Trgt'
    Text: 1417180192, // 'Txt '
    TextLayer: 1417170034, // 'TxLr'
    TextShapeType: 1413830740, // 'TEXT'
    To: 1411391520, // 'T   '
    Top: 1416589344, // 'Top '
    Vertical: 1450341475, // 'Vrtc'
};

var stringID = {
    Bounds: 1484, // 'bounds'
    Box: 2440, // 'box'
    TextKey: 1417180192, // 'textKey'
    TextShape: 1470, // 'textShape'
    TextType: 1413830740, // 'textType'
};


function _changeToPointText() {
    var reference = new ActionReference();
    reference.putProperty(charID.Property, charID.TextShapeType);
    reference.putEnumerated(charID.TextLayer, charID.Ordinal, charID.Target);
    var descriptor = new ActionDescriptor();
    descriptor.putReference(charID.Null, reference);
    descriptor.putEnumerated(charID.To, charID.TextShapeType, charID.Point);
    executeAction(charID.Set, descriptor, DialogModes.NO);
}


function _changeToBoxText() {
    var reference = new ActionReference();
    reference.putProperty(charID.Property, charID.TextShapeType);
    reference.putEnumerated(charID.TextLayer, charID.Ordinal, charID.Target);
    var descriptor = new ActionDescriptor();
    descriptor.putReference(charID.Null, reference);
    descriptor.putEnumerated(charID.To, charID.TextShapeType, stringID.Box);
    executeAction(charID.Set, descriptor, DialogModes.NO);
}


function _layerIsTextLayer() {
    var layer = _getCurrent(charID.Layer, charID.Text);
    return layer.hasKey(charID.Text);
}


function _textLayerIsPointText() {
    var textKey = _getCurrent(charID.Layer, stringID.TextKey).getObjectValue(stringID.TextKey);
    var textType = textKey.getList(stringID.TextShape).getObjectValue(0).getEnumerationValue(stringID.TextType);
    return (textType === charID.Point);
}


function _convertPixelToPoint(value) {
    return parseInt(value) / activeDocument.resolution * 72;
}


function _createCurrent(target, id) {
    var reference = new ActionReference();
    if (id > 0) reference.putProperty(charID.Property, id);
    reference.putEnumerated(target, charID.Ordinal, charID.Target);
    return reference;
}


function _getCurrent(target, id) {
    return executeActionGet(_createCurrent(target, id));
}


function _deselect() {
    var reference = new ActionReference();
    reference.putProperty(charID.Channel, charID.FrameSelect);
    var descriptor = new ActionDescriptor();
    descriptor.putReference(charID.Null, reference);
    descriptor.putEnumerated(charID.To, charID.Ordinal, charID.None);
    executeAction(charID.Set, descriptor, DialogModes.NO);
}


function _getBoundsFromDescriptor(bounds) {
    var top = bounds.getInteger(charID.Top);
    var left = bounds.getInteger(charID.Left);
    var right = bounds.getInteger(charID.Right);
    var bottom = bounds.getInteger(charID.Bottom);
    return {
        top: top,
        left: left,
        right: right,
        bottom: bottom,
        width: right - left,
        height: bottom - top,
        xMid: (left + right) / 2,
        yMid: (top + bottom) / 2
    };
}


function _getCurrentSelectionBounds() {
    var doc = _getCurrent(charID.Document, charID.FrameSelect);
    if (doc.hasKey(charID.FrameSelect)) {
        var bounds = doc.getObjectValue(charID.FrameSelect);
        return _getBoundsFromDescriptor(bounds);
    }
}


function _getCurrentTextLayerBounds() {
    var bounds = _getCurrent(charID.Layer, stringID.Bounds).getObjectValue(stringID.Bounds);
    return _getBoundsFromDescriptor(bounds);
}


function _modifySelectionBounds(amount) {
    if (amount == 0) return;
    var size = new ActionDescriptor();
    size.putUnitDouble(charID.By, charID.PixelUnit, Math.abs(amount));
    executeAction(amount > 0 ? charID.Expand : charID.Contract, size, DialogModes.NO);
}


function _moveLayer(layer, offsetX, offsetY) {
    var amount = new ActionDescriptor();
    amount.putUnitDouble(charID.Horizontal, charID.PixelUnit, offsetX);
    amount.putUnitDouble(charID.Vertical, charID.PixelUnit, offsetY);
    var target = new ActionDescriptor();
    target.putReference(charID.Null, layer);
    target.putObject(charID.To, charID.Offset, amount);
    executeAction(charID.Move, target, DialogModes.NO);
}


function _createAndSetLayerText(data, width, height) {
    data.style.textProps.layerText.textKey = data.text.replace(/\n+/g, '');
    data.style.textProps.layerText.textStyleRange[0].to = data.text.length;
    data.style.textProps.layerText.paragraphStyleRange[0].to = data.text.length;
    data.style.textProps.layerText.textShape = [{
        "textType": "box",
        "orientation": "horizontal",
        "bounds": {
            "top": 0,
            "left": 0,
            "right" : _convertPixelToPoint(width),
            "bottom": _convertPixelToPoint(height)
        }
    }];
    jamEngine.jsonPlay("make", {
        "target": ["<reference>", [["textLayer", ["<class>", null]]]],
        "using": jamText.toLayerTextObject(data.style.textProps)
    });
}


function _setTextBoxSize(width, height) {
    var box = [{
        "textType": "box",
        "orientation": "horizontal",
        "bounds": {
            "top": 0,
            "left": 0,
            "right" : _convertPixelToPoint(width),
            "bottom": _convertPixelToPoint(height)
        }
    }];
    jamText.setLayerText({layerText: {textShape: box}});
}


function _checkSelection() {
    var selection = _getCurrentSelectionBounds();
    if (selection === undefined) {
        return {error: 'noSelection'};
    }
    _modifySelectionBounds(-10);
    selection = _getCurrentSelectionBounds();
    if ((selection === undefined) || (selection.width * selection.height < 200)) {
        return {error: 'smallSelection'};
    }
    return selection;
}




/* ========================================================= */
/* ============ full methods for suspendHistory ============ */
/* ========================================================= */


var setActiveLayerTextData;
var setActiveLayerTextResult;

function _setActiveLayerTextFull() {
    if (!setActiveLayerTextData) {
        setActiveLayerTextResult = '';
        return;
    } else if (!documents.length) {
        setActiveLayerTextResult = 'doc';
        return;
    } else if (!_layerIsTextLayer()) {
        setActiveLayerTextResult = 'layer';
        return;
    }
    var dataText = setActiveLayerTextData.text;
    var dataStyle = setActiveLayerTextData.style;
    var oldBounds = _getCurrentTextLayerBounds();
    var isPoint = _textLayerIsPointText();
    if (isPoint) _changeToBoxText();
    var oldTextParams = jamText.getLayerText();
    var newTextParams;
    if (dataText && dataStyle) {
        newTextParams = dataStyle.textProps;
        newTextParams.layerText.textKey = dataText.replace(/\n+/g, '');
        newTextParams.layerText.textStyleRange[0].to = dataText.length;
        newTextParams.layerText.paragraphStyleRange[0].to = dataText.length;
    } else if (dataText) {
        newTextParams = {
            layerText: {
                textKey: dataText.replace(/\n+/g, '')
            }
        }
    } else if (dataStyle) {
        var text = activeDocument.activeLayer.textItem.contents;
        newTextParams = dataStyle.textProps;
        newTextParams.layerText.textStyleRange[0].to = text.length;
        newTextParams.layerText.paragraphStyleRange[0].to = text.length;
    }
    newTextParams.layerText.textShape = oldTextParams.layerText.textShape;
    newTextParams.layerText.textShape[0].bounds.bottom *= 15;
    jamText.setLayerText(newTextParams);
    var newBounds = _getCurrentTextLayerBounds();
    if (isPoint) {
        _changeToPointText();
    } else {
        newTextParams.layerText.textShape[0].bounds.bottom = _convertPixelToPoint(newBounds.height + 2);
        jamText.setLayerText({
            layerText: {
                textShape: newTextParams.layerText.textShape
            }
        });
    }
    var offsetX = oldBounds.xMid - newBounds.xMid;
    var offsetY = oldBounds.yMid - newBounds.yMid;
    _moveLayer(_createCurrent(charID.Layer), offsetX, offsetY);
    setActiveLayerTextResult = '';
}


var createTextLayerInSelectionData;
var createTextLayerInSelectionPoint;
var createTextLayerInSelectionResult;

function _createTextLayerInSelectionFull() {
    if (!documents.length) {
        createTextLayerInSelectionResult = 'doc';
        return;
    }
    var selection = _checkSelection();
    if (selection.error) {
        createTextLayerInSelectionResult = selection.error;
        return;
    }
    var width = selection.width * .9;
    var height = selection.height * 15;
    _createAndSetLayerText(createTextLayerInSelectionData, width, height);
    var bounds = _getCurrentTextLayerBounds();
    if (createTextLayerInSelectionPoint) {
        _changeToPointText();
    } else {
        _setTextBoxSize(width, bounds.height + 2);
    }
    var offsetX = selection.xMid - bounds.xMid;
    var offsetY = selection.yMid - bounds.yMid;
    _moveLayer(_createCurrent(charID.Layer), offsetX, offsetY);
    createTextLayerInSelectionResult = '';
}


var alignTextLayerToSelectionResult;

function _alignTextLayerToSelectionFull() {
    if (!documents.length) {
        alignTextLayerToSelectionResult = 'doc';
        return;
    } else if (!_layerIsTextLayer()) {
        alignTextLayerToSelectionResult = 'layer';
        return;
    }
    var selection = _checkSelection();
    if (selection.error) {
        createTextLayerInSelectionResult = selection.error;
        return;
    }
    var isPoint = _textLayerIsPointText();
    var width = selection.width * .9;
    var height = selection.height * 15;
    _setTextBoxSize(width, height);
    var bounds = _getCurrentTextLayerBounds();
    if (isPoint) {
        _changeToPointText();
    } else {
        _setTextBoxSize(width, bounds.height + 2);
    }
    _deselect();
    var offsetX = selection.xMid - bounds.xMid;
    var offsetY = selection.yMid - bounds.yMid;
    _moveLayer(_createCurrent(charID.Layer), offsetX, offsetY);
    alignTextLayerToSelectionResult = '';
}




/* ======================================================== */
/* ==================== public methods ==================== */
/* ======================================================== */


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
    var fontsArr = [];
    for (var i = 0; i < app.fonts.length; i++) {
        fontsArr.push({
            name: app.fonts[i].name,
            postScriptName: app.fonts[i].postScriptName,
            family: app.fonts[i].family,
            style: app.fonts[i].style
        });
    }
    return jamJSON.stringify({
        fonts: fontsArr
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
    setActiveLayerTextData = data;
    app.activeDocument.suspendHistory('TyperTools Change', '_setActiveLayerTextFull()');
    return setActiveLayerTextResult;
}


function createTextLayerInSelection(data, point) {
    createTextLayerInSelectionData = data;
    createTextLayerInSelectionPoint = point;
    app.activeDocument.suspendHistory('TyperTools Paste', '_createTextLayerInSelectionFull()');
    return createTextLayerInSelectionResult;
}


function alignTextLayerToSelection() {
    app.activeDocument.suspendHistory('TyperTools Align', '_alignTextLayerToSelectionFull()');
    return alignTextLayerToSelectionResult;
}