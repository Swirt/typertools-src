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

var charID = {
    Bottom : 1114926957, // 'Btom'
    By : 1115234336, // 'By  '
    Contract : 1131312227, // 'Cntc'
    Document : 1147366766, // 'Dcmn'
    Expand : 1165521006, // 'Expn'
    FrameSelect : 1718838636, // 'fsel'
    Horizontal : 1215461998, // 'Hrzn'
    Layer : 1283027488, // 'Lyr '
    Left : 1281713780, // 'Left'
    Move : 1836021349, // 'move'
    Null : 1853189228, // 'null'
    Offset : 1332114292, // 'Ofst'
    Ordinal : 1332896878, // 'Ordn'
    PixelUnit : 592476268, // '#Pxl'
    Point : 1349415968, // 'Pnt '
    Property : 1349677170, // 'Prpr'
    Right : 1382508660, // 'Rght'
    Set : 1936028772, // 'setd'
    Target : 1416783732, // 'Trgt'
    Text : 1417180192, // 'Txt '
    TextLayer : 1417170034, // 'TxLr'
    TextShapeType : 1413830740, // 'TEXT'
    To : 1411391520, // 'T   '
    Top : 1416589344, // 'Top '
    Vertical : 1450341475, // 'Vrtc'
};

function changeToPointText() {
    var reference = new ActionReference();
    reference.putProperty(charID.Property, charID.TextShapeType);
    reference.putEnumerated(charID.TextLayer, charID.Ordinal, charID.Target);
    
    var descriptor = new ActionDescriptor();
    descriptor.putReference(charID.Null, reference);
    descriptor.putEnumerated(charID.To, charID.TextShapeType, charID.Point);
    
    executeAction(charID.Set, descriptor, DialogModes.NO);
}

function convertPointToPercentage(x, y) {
    return [x / parseInt(activeDocument.width) * 100, y / parseInt(activeDocument.height) * 100];
}

function convertPixelToPoint(value) {
    return parseInt(value) / activeDocument.resolution * 72;
}

function createCurrent(target, id) 
{
    var reference = new ActionReference();
    
    if ( id > 0) 
    {
        reference.putProperty(charID.Property, id);
    }

    reference.putEnumerated(target, charID.Ordinal, charID.Target);
    
    return reference;
}

function getCurrent(target, id)
{
    return  executeActionGet(createCurrent(target, id));
}

function getBoundsFromDescriptor(bounds)
{
    var top = bounds.getInteger(charID.Top);
    var left = bounds.getInteger(charID.Left);
    var right = bounds.getInteger(charID.Right);
    var bottom = bounds.getInteger(charID.Bottom);
    
    return {left: left,
                 top: top,
                 right: right,
                 bottom: bottom,
                 width: right - left,
                 height: bottom - top,
                 xMid: (left + right) / 2,
                 yMid: (top + bottom) / 2};
}

function getCurrentSelectionBounds()
{
    var doc = getCurrent(charID.Document, charID.FrameSelect);

    if (doc.hasKey(charID.FrameSelect))
    {
        var bounds = doc.getObjectValue(charID.FrameSelect);
        return getBoundsFromDescriptor(bounds);
    }    
}

function getCurrentTextLayerBounds() 
{
    var layer = getCurrent(charID.Layer, charID.Text);
    var boundsID = stringIDToTypeID("bounds");
    
    if (layer.hasKey(charID.Text)) 
    {
        var bounds = getCurrent(charID.Layer, boundsID).getObjectValue(boundsID);
        
        return getBoundsFromDescriptor(bounds);
    }
}

function modifySelectionBounds(amount) {
    if (amount == 0) return;
    
    var size = new ActionDescriptor();
        size.putUnitDouble(charID.By, charID.PixelUnit, Math.abs(amount));
    
    executeAction(amount > 0 ? charID.Expand : charID.Contract, size, DialogModes.NO);
}

function moveLayer(layer, offsetX, offsetY)
{
    var amount = new ActionDescriptor();
    amount.putUnitDouble(charID.Horizontal, charID.PixelUnit, offsetX);
    amount.putUnitDouble(charID.Vertical, charID.PixelUnit, offsetY);
    
    var target = new ActionDescriptor();
    target.putReference(charID.Null, layer);
    target.putObject(charID.To, charID.Offset, amount);
    
    executeAction(charID.Move, target, DialogModes.NO);
}

function createAndSetLayerText(data, width, height)
{
    data.style.textProps.layerText.textKey = data.text.replace(/\n+/gi, '');
    data.style.textProps.layerText.textStyleRange[0].to = data.text.length;
    data.style.textProps.layerText.paragraphStyleRange[0].to = data.text.length;
    data.style.textProps.layerText.textShape = [
        {
            "textType": "box",
            "orientation": "horizontal",
            "bounds": {
                "top": 0,
                "left": 0,
                "bottom": convertPixelToPoint(height),
                "right" : convertPixelToPoint(width)
            }
        }
    ];

    var layerText = data.style.textProps;

    jamEngine.jsonPlay(
        "make",
        {
            "target": [ "<reference>", [ [ "textLayer", [ "<class>", null ] ] ] ],
            "using": jamText.toLayerTextObject (layerText)
        }
    )
}

// evidently you can't pass class variables with suspendHistory, only simple ones
// so a global variable seems to be necessary
var currentTextLayerData;
// suspendHistory also doesn't return a result, so unfortunately it seems necessary
// to create a global variable for that as well
var createTextLayerInSelectionResult;

// just throwing this in here if you decide to actually make it a setting
var useTextBox = true;

function createTextLayerAction() {
    if (!documents.length) {
        createTextLayerInSelectionResult = 'doc';
        return;
    }

    var selection = getCurrentSelectionBounds();

    if (selection === undefined) {
        createTextLayerInSelectionResult = 'noSelection';
        return;
    }
    
    // remove the 'tail' on speech bubbles, you might want to make this some kind of
    // option or remove it. I generally use it since i'd expect the user to be using a
    // magic want selection. For other
    modifySelectionBounds(-10); 

    selection = getCurrentSelectionBounds();

    if (selection === undefined) { // check one more time after contracting
        createTextLayerInSelectionResult = 'noSelection';
        return;
    } else if (selection.width * selection.height < 200) {
        createTextLayerInSelectionResult = 'smallSelection';
        return;
    }

    // 90% is probably fine with the selection being contracted by 10px
    var width = selection.width * .9;
    var height = selection.height * 15;
    
    createAndSetLayerText(currentTextLayerData, width, height);
    
    var bounds = getCurrentTextLayerBounds();

    if (useTextBox) {
        // i'll probably look at how to set this with action manager eventually.
        // it took ~80ms vs ~30ms for the changeToPoint. would think there would be
        // some decent gains from setting via action manager rather than DOM
        activeDocument.activeLayer.textItem.height = bounds.height + 2;
    } else {
        // personally, i'm a bigger fan of point text rather than a text box
        // if you don't go this route, you'd need to adjust the bounds of the text box
        // to fit the text tighter since the height is quite a bit larger.
        // if the height is inadequate to fit the text in the text box, text will get truncated
        // when converting to point text, that's why the height is set so much larger.
        // also, this does break your "paste text to current layer" a bit, since it's no longer a
        // textbox, it would be possible to convert the layer back to a textbox prior to applying
        changeToPointText();
    }

    // it's worth noting that the bounds retrieved here are the bounds of the text
    // rather than the text box(if it's still a text box) so it will do a good job
    // of giving you the midpoint of the actual text
    var offsetx = selection.xMid - bounds.xMid;
    var offsety = selection.yMid - bounds.yMid;

    // you could align, but offsetting the text layer by the difference of the midpoints does the same thing in one action
    moveLayer(createCurrent(charID.Layer), offsetx, offsety);

    createTextLayerInSelectionResult = '';
}

function createTextLayerInSelection(data) {
    currentTextLayerData = data;
    app.activeDocument.suspendHistory('Create Text Layer', 'createTextLayerAction()');
    
    return createTextLayerInSelectionResult;
}
