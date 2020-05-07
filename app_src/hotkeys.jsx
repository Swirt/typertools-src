import React from 'react';

import {createTextLayerInSelection, alignTextLayerToSelection, getHotkeyPressed} from './utils';
import {useContext} from './context';


const intervalTime = 150;
let kayboardInterval = 0;
const repeatTime = 2000;
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
            const line = context.state.currentLine || {};
            createTextLayerInSelection((line.text || ''), context.state.currentStyle, ok => {
                if (ok) context.dispatch({type: 'nextLine'});
            });
        } else if (state === 'metaAlt') {
            if (!checkRepeatTime()) return;
            alignTextLayerToSelection();
        } else {
            keyUp = true;
        }
    };

    clearInterval(kayboardInterval);
    kayboardInterval = setInterval(() => {
        getHotkeyPressed(checkState);
    }, intervalTime);
    return <React.Fragment />;
});

export default HotkeysListner;