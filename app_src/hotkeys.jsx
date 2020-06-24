import _ from 'lodash';
import React from 'react';

import {csInterface, setActiveLayerText, createTextLayerInSelection, alignTextLayerToSelection, getHotkeyPressed} from './utils';
import {useContext} from './context';


const repeatTime = 2000;
const intervalTime = 120;
let keyboardInterval = 0;
let canRepeat = true;
let keyUp = true;

const checkRepeatTime = () => {
    if (canRepeat && keyUp) {
        setTimeout(() => {
            canRepeat = true;
        }, repeatTime);
        canRepeat = false;
        keyUp = false;
        return true;
    } else {
        return false;
    }
};

const HotkeysListner = React.memo(function HotkeysListner() {
    const context = useContext();

    const checkState = state => {
        if (state === 'metaCtrl') {
            if (!checkRepeatTime()) return;
            const line = context.state.currentLine || {text: ''};
            let style = context.state.currentStyle;
            if (style && context.state.currentFontSize) {
                style = _.cloneDeep(style);
                style.textProps.layerText.textStyleRange[0].textStyle.size = context.state.currentFontSize;
            }
            createTextLayerInSelection(line.text, style, ok => {
                if (ok) context.dispatch({type: 'nextLine'});
            });
        } else if (state === 'metaShift') {   
            if (!checkRepeatTime()) return;
            const line = context.state.currentLine || {text: ''};
            let style = context.state.currentStyle;
            if (style && context.state.currentFontSize) {
                style = _.cloneDeep(style);
                style.textProps.layerText.textStyleRange[0].textStyle.size = context.state.currentFontSize;
            }
            setActiveLayerText(line.text, style, ok => {
                if (ok) context.dispatch({type: 'nextLine'});
            });
        } else if (state === 'metaAlt') {
            if (!checkRepeatTime()) return;
            alignTextLayerToSelection();
        } else {
            keyUp = true;
        }
    };

    clearInterval(keyboardInterval);
    keyboardInterval = setInterval(() => {
        getHotkeyPressed(checkState);
    }, intervalTime);

    document.onkeydown = e => {
        if (e.key === "Escape") {
            if (context.state.modalType) {
                context.dispatch({type: 'setModal'});
            }
        }
    };

    React.useEffect(() => {
        const keyInterests = [{"keyCode": 27}];
        csInterface.registerKeyEventsInterest(JSON.stringify(keyInterests));
    }, []);

    return <React.Fragment />;
});

export default HotkeysListner;