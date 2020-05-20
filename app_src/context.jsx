import React from 'react';
import PropTypes from 'prop-types';
import {readStorage, writeToStorage, scrollToLine} from './utils';


const storage = readStorage();
const storeFields = ['notFirstTime', 'text', 'styles', 'currentLineIndex', 'currentStyleId', 'ignoreLinePrefixes', 'defaultStyleId'];

const initialState = {
    notFirstTime: false,
    text: '',
    lines: [],
    styles: [],
    currentLine: null,
    currentLineIndex: 0,
    currentStyle: null,
    currentStyleId: null,
    currentFontSize: 14,
    ignoreLinePrefixes: ['##'],
    defaultStyleId: null,
    modalType: null,
    modalData: {},
    ...storage.data
};

const reducer = (state, action) => {
    console.log('CONTEXT:', action);

    let thenScroll = false;
    let thenSelectStyle = false;
    const newState = Object.assign({}, state);
    switch (action.type) {

        case 'removeFirstTime': {
            newState.notFirstTime = true;
            newState.modalType = 'help';
            break;
        }

        case 'import': {
            for (const field in action.data) {
                if (!action.data.hasOwnProperty(field)) continue;
                if (!initialState.hasOwnProperty(field)) continue;
                newState[field] = action.data[field];
            }
            break;
        }

        case 'setText': {
            newState.text = action.text;
            break;
        }

        case 'setCurrentLineIndex': {
            newState.currentLineIndex = action.index;
            thenSelectStyle = true;
            break;
        }

        case 'prevLine': {
            if (!state.text) break;
            let newIndex = state.currentLineIndex;
            for (let i = newIndex - 1; i >= 0; i--) {
                if (!state.lines[i].ignore) {
                    newState.currentLineIndex = state.lines[i].rawIndex;
                    break;
                }
            }
            thenScroll = true;
            thenSelectStyle = true;
            break;
        }

        case 'nextLine': {
            if (!state.text) break;
            let newIndex = state.currentLineIndex;
            for (let i = newIndex + 1; i < state.lines.length; i++) {
                if (!state.lines[i].ignore) {
                    newState.currentLineIndex = state.lines[i].rawIndex;
                    break;
                }
            }
            thenScroll = true;
            thenSelectStyle = true;
            break;
        }

        case 'setCurrentStyleId': {
            newState.currentStyleId = action.id;
            break;
        }

        case 'setCurrentFontSize': {
            newState.currentFontSize = action.size;
            break;
        }

        case 'saveStyle': {
            if (typeof action.data.prefixes === 'string') {
                const arr = action.data.prefixes.split(/\s+/);
                action.data.prefixes = arr.filter(Boolean);
            } else if (!Array.isArray(action.data.prefixes)) {
                action.data.prefixes = [];
            }
            const styles = state.styles.concat([]);
            const editId = action.id || action.data.id;
            const style = styles.find(s => (s.id === editId));
            if (style) Object.assign(style, action.data);
            else styles.push(action.data);
            newState.styles = styles;
            break;
        }

        case 'deleteStyle': {
            newState.styles = state.styles.filter(s => (s.id !== action.id));
            break;
        }

        case 'setStyles': {
            newState.styles = action.data || [];
            break;
        }

        case 'setIgnoreLinePrefixes': {
            if (!action.data) {
                newState.ignoreLinePrefixes = [];
            } else if (Array.isArray(action.data)) {
                newState.ignoreLinePrefixes = action.data;
            } else if (typeof action.data === 'string') {
                const arr = action.data.split(/\s+/);
                newState.ignoreLinePrefixes = arr.filter(Boolean);
            }
            break;
        }

        case 'setDeaultStyleId': {
            newState.defaultStyleId = action.id || null;
            break;
        }

        case 'setModal': {
            newState.modalType = action.modal || null;
            newState.modalData = action.data || {};
            break;
        }
    }

    const stylePrefixes = [];
    for (const style of newState.styles) {
        for (const prefix of style.prefixes) {
            stylePrefixes.push({prefix, style});
        }
    }
    if (newState.defaultStyleId) {
        const hasDefault = newState.styles.find(s => (s.id === newState.defaultStyleId));
        if (!hasDefault) newState.defaultStyleId = null;
    }
    let linesCounter = 0;
    const rawLines = newState.text ? newState.text.split('\n') : [];
    newState.lines = rawLines.map((rawText, rawIndex) => {
        const ignorePrefix = newState.ignoreLinePrefixes.find(pr => rawText.startsWith(pr)) || '';
        const hasStylePrefix = stylePrefixes.find(sp => rawText.startsWith(sp.prefix));
        const stylePrefix = hasStylePrefix ? hasStylePrefix.prefix : '';
        const style = hasStylePrefix ? hasStylePrefix.style : null;
        const text = rawText.replace(ignorePrefix, '').replace(stylePrefix, '').trim();
        const ignore = !!ignorePrefix || !text;
        const index = ignore ? 0 : ++linesCounter;
        return {rawText, rawIndex, ignorePrefix, stylePrefix, style, ignore, index, text};
    });
    newState.lines.lastIndex = linesCounter;
    newState.currentLine = newState.lines[newState.currentLineIndex] || null;
    if (!newState.currentLine || newState.currentLine.ignore) {
        let newIndex = 0;
        for (let line of newState.lines) {
            if (!line.ignore) {
                newIndex = line.rawIndex;
                break;
            }
        }
        newState.currentLine = newState.lines[newIndex] || null;
        newState.currentLineIndex = newIndex;
    }
    if (thenScroll) {
        scrollToLine(newState.currentLineIndex);
    }
    if (thenSelectStyle) {
        if (newState.currentLine.style) {
            newState.currentStyleId = newState.currentLine.style.id;
        } else if (newState.defaultStyleId) {
            newState.currentStyleId = newState.defaultStyleId;
        }
    }
    newState.currentStyle = newState.styles.find(s => (s.id === newState.currentStyleId));
    if (!newState.currentStyle) {
        let newId = newState.styles.length ? newState.styles[0].id : null;
        newState.currentStyle = newId ? newState.styles[0] : null;
        newState.currentStyleId = newId;
    }

    const dataToStore = {};
    for (let field in newState) {
        if (!newState.hasOwnProperty(field)) continue;
        if (storeFields.includes(field)) {
            dataToStore[field] = newState[field];
        }
    }
    writeToStorage(dataToStore);

    return newState;
};


const Context = React.createContext();
const useContext = () => React.useContext(Context);
const ContextProvider = React.memo(function ContextProvider(props) {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    React.useEffect(() => dispatch({}), []);
    return <Context.Provider value={{state, dispatch}}>{props.children}</Context.Provider>
});
ContextProvider.propTypes = {
    children: PropTypes.any.isRequired
};

export {useContext, ContextProvider};