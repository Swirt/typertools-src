/*
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamActions-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamEngine-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamHelpers-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamJSON-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamText-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamStyles-min.jsxinc');
$.evalFile(Folder.userData + '/Adobe/CEP/extensions/typertools/app/lib/jam/jamUtils-min.jsxinc');
*/

/* globals app, documents, activeDocument, ScriptUI, DialogModes, LayerKind, ActionReference, ActionDescriptor, executeAction, executeActionGet, stringIDToTypeID, jamEngine, jamJSON, jamText */


var charID = {
    Back: 1113678699, // 'Back'
    Background: 1113811815, // 'Bckg'
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
    Select: 1936483188, // 'slct'
    Set: 1936028772, // 'setd'
    Size: 1400512544, // 'Sz  '
    Target: 1416783732, // 'Trgt'
    Text: 1417180192, // 'Txt '
    TextLayer: 1417170034, // 'TxLr'
    TextShapeType: 1413830740, // 'TEXT'
    TextStyle: 1417180243, // 'TxtS'
    TextStyleRange: 1417180276, // 'Txtt'
    To: 1411391520, // 'T   '
    Top: 1416589344, // 'Top '
    Vertical: 1450341475, // 'Vrtc'
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
    descriptor.putEnumerated(charID.To, charID.TextShapeType, stringIDToTypeID('box'));
    executeAction(charID.Set, descriptor, DialogModes.NO);
}


function _layerIsTextLayer() {
    var layer = _getCurrent(charID.Layer, charID.Text);
    return layer.hasKey(charID.Text);
}


function _textLayerIsPointText() {
    var textKey = _getCurrent(charID.Layer, charID.Text).getObjectValue(charID.Text);
    var textType = textKey.getList(stringIDToTypeID('textShape')).getObjectValue(0).getEnumerationValue(charID.TextShapeType);
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
    var boundsTypeId = stringIDToTypeID('bounds');
    var bounds = _getCurrent(charID.Layer, boundsTypeId).getObjectValue(boundsTypeId);
    return _getBoundsFromDescriptor(bounds);
}


function _modifySelectionBounds(amount) {
    if (amount == 0) return;
    var size = new ActionDescriptor();
    size.putUnitDouble(charID.By, charID.PixelUnit, Math.abs(amount));
    executeAction(amount > 0 ? charID.Expand : charID.Contract, size, DialogModes.NO);
}


function _moveLayer(offsetX, offsetY) {
    var amount = new ActionDescriptor();
    amount.putUnitDouble(charID.Horizontal, charID.PixelUnit, offsetX);
    amount.putUnitDouble(charID.Vertical, charID.PixelUnit, offsetY);
    var target = new ActionDescriptor();
    target.putReference(charID.Null, _createCurrent(charID.Layer));
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


function _forEachSelectedLayer(action) {
    var selectedLayers = [];
    var reference = new ActionReference();
    var targetLayers = stringIDToTypeID("targetLayers");
    reference.putProperty(charID.Property, targetLayers);
    reference.putEnumerated(charID.Document, charID.Ordinal, charID.Target);
    var doc = executeActionGet(reference);
    if (doc.hasKey(targetLayers)) {
        doc = doc.getList(targetLayers);
        var ref2 = new ActionReference();
        ref2.putProperty(charID.Property, charID.Background);
        ref2.putEnumerated(charID.Layer, charID.Ordinal, charID.Back);
        var offset = executeActionGet(ref2).getBoolean(charID.Background) ? 0 : 1;
        for (var i = 0; i < doc.count; i++) {
            selectedLayers.push(doc.getReference(i).getIndex() + offset);
        }
    }
    if (selectedLayers.length > 1) {
        for (var j = 0; j < selectedLayers.length; j++) {
            var descr = new ActionDescriptor();
            var ref3 = new ActionReference();
            ref3.putIndex(charID.Layer, selectedLayers[j]);
            descr.putReference(charID.Null, ref3);
            executeAction(charID.Select, descr, DialogModes.NO);
            action(selectedLayers[j]);
        }
        var ref4 = new ActionReference();
        for (var k = 0; k < selectedLayers.length; k++) {
            ref4.putIndex(charID.Layer, selectedLayers[k]);
        }
        var descr2 = new ActionDescriptor();
        descr2.putReference(charID.Null, ref4);
        executeAction(charID.Select, descr2, DialogModes.NO);
    } else if (selectedLayers.length === 1) {
        action(selectedLayers[0]);
    }
}




/* ========================================================= */
/* ============ full methods for suspendHistory ============ */
/* ========================================================= */


var setActiveLayerTextData;
var setActiveLayerTextResult;

function _setActiveLayerText() {
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

    _forEachSelectedLayer(function() {
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
            if (oldTextParams.layerText.textStyleRange && oldTextParams.layerText.textStyleRange[0]) {
                newTextParams.layerText.textStyleRange = [oldTextParams.layerText.textStyleRange[0]];
                newTextParams.layerText.textStyleRange[0].to = dataText.length;
            }
            if (oldTextParams.layerText.paragraphStyleRange && oldTextParams.layerText.paragraphStyleRange[0]) {
                newTextParams.layerText.paragraphStyleRange = [oldTextParams.layerText.paragraphStyleRange[0]];
                newTextParams.layerText.paragraphStyleRange[0].to = dataText.length;
            }
        } else if (dataStyle) {
            var text = oldTextParams.layerText.textKey || '';
            newTextParams = dataStyle.textProps;
            newTextParams.layerText.textStyleRange[0].to = text.length;
            newTextParams.layerText.paragraphStyleRange[0].to = text.length;
        }
        newTextParams.layerText.textShape = [oldTextParams.layerText.textShape[0]];
        newTextParams.layerText.textShape[0].bounds.bottom *= 15;
        newTextParams.typeUnit = oldTextParams.typeUnit;
        jamText.setLayerText(newTextParams);
        var newBounds = _getCurrentTextLayerBounds();
        if (isPoint) {
            _changeToPointText();
        } else {
            var textSize = 12;
            if (dataStyle) {
                textSize = dataStyle.textProps.layerText.textStyleRange[0].textStyle.size;
            } else if (oldTextParams.layerText.textStyleRange && oldTextParams.layerText.textStyleRange[0]) {
                textSize = oldTextParams.layerText.textStyleRange[0].textStyle.size;
            }
            newTextParams.layerText.textShape[0].bounds.bottom = _convertPixelToPoint(newBounds.height + textSize + 2);
            jamText.setLayerText({
                layerText: {
                    textShape: newTextParams.layerText.textShape
                }
            });
        }
        if (!oldBounds.bottom) oldBounds = newBounds;
        var offsetX = oldBounds.xMid - newBounds.xMid;
        var offsetY = oldBounds.yMid - newBounds.yMid;
        _moveLayer(offsetX, offsetY);
    });

    setActiveLayerTextResult = '';
}


var createTextLayerInSelectionData;
var createTextLayerInSelectionPoint;
var createTextLayerInSelectionResult;

function _createTextLayerInSelection() {
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
        var textParams = jamText.getLayerText();
        var textSize = textParams.layerText.textStyleRange[0].textStyle.size;
        _setTextBoxSize(width, bounds.height + textSize + 2);
    }
    var offsetX = selection.xMid - bounds.xMid;
    var offsetY = selection.yMid - bounds.yMid;
    _moveLayer(offsetX, offsetY);
    createTextLayerInSelectionResult = '';
}


var alignTextLayerToSelectionResult;

function _alignTextLayerToSelection() {
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
        var textParams = jamText.getLayerText();
        var textSize = textParams.layerText.textStyleRange[0].textStyle.size;
        _setTextBoxSize(width, bounds.height + textSize + 2);
    }
    _deselect();
    var offsetX = selection.xMid - bounds.xMid;
    var offsetY = selection.yMid - bounds.yMid;
    _moveLayer(offsetX, offsetY);
    alignTextLayerToSelectionResult = '';
}


var changeActiveLayerTextSizeVal;
var changeActiveLayerTextSizeResult;

function _changeActiveLayerTextSize() {
    if (!documents.length) {
        changeActiveLayerTextSizeResult = 'doc';
        return;
    } else if (!_layerIsTextLayer()) {
        changeActiveLayerTextSizeResult = 'layer';
        return;
    } else if (!changeActiveLayerTextSizeVal) {
        changeActiveLayerTextSizeResult = '';
        return;
    }

    _forEachSelectedLayer(function() {
        var oldTextParams = jamText.getLayerText();
        var text = oldTextParams.layerText.textKey.replace(/\n+/g, '');
        if (!text) {
            changeActiveLayerTextSizeResult = 'layer';
            return;
        }
        var oldBounds = _getCurrentTextLayerBounds();
        var isPoint = _textLayerIsPointText();
        var newTextParams = {
            typeUnit: oldTextParams.typeUnit,
            layerText: {
                textKey: text,
                textStyleRange: [oldTextParams.layerText.textStyleRange[0]]
            }
        };
        if (oldTextParams.layerText.paragraphStyleRange) {
            newTextParams.layerText.paragraphStyleRange = [oldTextParams.layerText.paragraphStyleRange[0]];
            newTextParams.layerText.paragraphStyleRange[0].to = text.length;
        }
        var newTextSize = newTextParams.layerText.textStyleRange[0].textStyle.size + changeActiveLayerTextSizeVal;
        newTextParams.layerText.textStyleRange[0].textStyle.size = newTextSize;
        newTextParams.layerText.textStyleRange[0].to = text.length;
        if (!isPoint) {
            if (changeActiveLayerTextSizeVal > 0) {
                newTextParams.layerText.textShape = [oldTextParams.layerText.textShape[0]];
                newTextParams.layerText.textShape[0].bounds.bottom *= 1.12;
                newTextParams.layerText.textShape[0].bounds.right *= 1.06;
            }
        }
        jamText.setLayerText(newTextParams);
        var newBounds = _getCurrentTextLayerBounds();
        var offsetX = oldBounds.xMid - newBounds.xMid;
        var offsetY = oldBounds.yMid - newBounds.yMid;
        _moveLayer(offsetX, offsetY);
    });

    changeActiveLayerTextSizeResult = '';
}


function _changeSize_alt() {
    var increasing = changeActiveLayerTextSizeVal > 0;
    _forEachSelectedLayer(function() {
        var a = new ActionReference();
        a.putProperty(charID.Property, charID.Text);
        a.putEnumerated(charID.Layer, charID.Ordinal, charID.Target);
        var currentLayer = executeActionGet(a);
        if (currentLayer.hasKey(charID.Text)) {
            var settings = currentLayer.getObjectValue(charID.Text);
            var textStyleRange = settings.getList(charID.TextStyleRange);
            var sizes = [];
            var units = [];
            var proceed = true;
            for (var i = 0; i < textStyleRange.count; i++) {
                var style = textStyleRange.getObjectValue(i).getObjectValue(charID.TextStyle);
                sizes[i] = style.getDouble(charID.Size);
                units[i] = style.getUnitDoubleType(charID.Size);
                if (i > 0 && (sizes[i] !== sizes[i - 1] || units[i] !== units[i - 1])) {
                    proceed = false;
                    break;
                }
            }
            var amount = 0.2; // mm
            if (units[0] === charID.PixelUnit) amount = 1; // pixel
            else if (units[0] === 592473716) amount = 0.5; // point
            if (!increasing) amount *= -1;
            if (proceed) {
                var aa = new ActionDescriptor();
                var d = new ActionReference();
                d.putProperty(charID.Property, charID.TextStyle);
                d.putEnumerated(charID.TextLayer, charID.Ordinal, charID.Target);
                aa.putReference(charID.Null, d);
                var e = new ActionDescriptor();
                e.putUnitDouble(charID.Size, units[0], sizes[0] + amount);
                aa.putObject(charID.To, charID.TextStyle, e);
                executeAction(charID.Set, aa, DialogModes.NO);
            }
        }
    });
    changeActiveLayerTextSizeResult = '';
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
        var font = app.fonts[i];
        fontsArr.push({
            name: font.name,
            postScriptName: font.postScriptName,
            family: font.family,
            style: font.style
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
    app.activeDocument.suspendHistory('TyperTools Change', '_setActiveLayerText()');
    return setActiveLayerTextResult;
}


function createTextLayerInSelection(data, point) {
    createTextLayerInSelectionData = data;
    createTextLayerInSelectionPoint = point;
    app.activeDocument.suspendHistory('TyperTools Paste', '_createTextLayerInSelection()');
    return createTextLayerInSelectionResult;
}


function alignTextLayerToSelection() {
    app.activeDocument.suspendHistory('TyperTools Align', '_alignTextLayerToSelection()');
    return alignTextLayerToSelectionResult;
}


function changeActiveLayerTextSize(val) {
    changeActiveLayerTextSizeVal = val;
    app.activeDocument.suspendHistory('TyperTools Resize', '_changeActiveLayerTextSize()');
    return changeActiveLayerTextSizeResult;
}