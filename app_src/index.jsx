import 'babel-polyfill';

import './index.scss';
import './js/CSInterface';
import './js/themeManager';

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {ReactSortable} from "react-sortablejs";
import {FaFileExport, FaFileImport} from "react-icons/fa";
import {FiArrowUp, FiArrowDown, FiHelpCircle, FiArrowRightCircle, FiTarget, FiPlus, FiCopy, FiX} from "react-icons/fi";
import {MdEdit, MdDelete, MdSave} from "react-icons/md";


const appTitle = 'Typer Tools';
const appVersion = '0.6.0';
const authorName = 'Swirt';
const authorUrl = 'https://telegram.me/swirt';
const exportFileName = 'typerToolsExport';

const topHeight = 125;
const minMiddleHeight = 160;
const minBottomHeight = 260;
let allLayers = {};

const csInterface = new window.CSInterface();
const locale = csInterface.initResourceBundle();
const openUrl = window.cep.util.openURLInDefaultBrowser;
const path = csInterface.getSystemPath(window.SystemPath.EXTENSION);
const storagePath = path + '/app/storage';

csInterface.evalScript('$.evalFile("' + path + '/host/jam/jamActions-min.jsxinc")');
csInterface.evalScript('$.evalFile("' + path + '/host/jam/jamEngine-min.jsxinc")');
csInterface.evalScript('$.evalFile("' + path + '/host/jam/jamHelpers-min.jsxinc")');
csInterface.evalScript('$.evalFile("' + path + '/host/jam/jamJSON-min.jsxinc")');
csInterface.evalScript('$.evalFile("' + path + '/host/jam/jamText-min.jsxinc")');
csInterface.evalScript('$.evalFile("' + path + '/host/jam/jamStyles-min.jsxinc")');
csInterface.evalScript('$.evalFile("' + path + '/host/jam/jamUtils-min.jsxinc")');


const readStorage = key => {
    const result = window.cep.fs.readFile(storagePath);
    if (result.err) {
        return key ? void 0 : {
            error: result.err,
            data: {}
        };
    } else {
        const data = JSON.parse(result.data) || {};
        return key ? data[key] : {data};
    }
};

const writeToStorage = (data, rewrite) => {
    const storage = readStorage();
    if (storage.error || rewrite) {
        const result = window.cep.fs.writeFile(storagePath, JSON.stringify(data));
        return !result.err;
    } else {
        data = Object.assign({}, storage.data, data);
        const result = window.cep.fs.writeFile(storagePath, JSON.stringify(data));
        return !result.err;
    }
};

const getAllLayers = () => {
    csInterface.evalScript('getAllLayers()', data => {
        if (data) allLayers = JSON.parse(data);
        else allLayers = {};
    });
};

const getActiveLayerData = callback => {
    csInterface.evalScript('getActiveLayerData()', data => {
        callback(JSON.parse(data || '{}'));
    });
};

const getActiveLayerText = callback => {
    csInterface.evalScript('getActiveLayerText()', data => {
        const dataObj = JSON.parse(data || '{}');
        if (!data || !dataObj.layer || !dataObj.text) nativeAlert(locale.errorNoTextLayer, locale.errorTitle, true);
        else callback(dataObj);
    });
};

const setActiveLayerText = (text, style) => {
    const data = JSON.stringify({text, style});
    csInterface.evalScript('setActiveLayerText(' + data + ')', error => {
        if (error) nativeAlert(locale.errorNoTextLayer, locale.errorTitle, true);
    });
};

const nativeAlert = (text, title, isError) => {
    const data = JSON.stringify({text, title, isError});
    csInterface.evalScript('nativeAlert(' + data +')');
}

const nativeConfirm = (text, title, callback) => {
    const data = JSON.stringify({text, title});
    csInterface.evalScript('nativeConfirm(' + data +')', result => callback(!!result));
}

const resizeTextArea = () => {
    const textArea = document.querySelector('.text-area');
    const textLines = document.querySelector('.text-lines');
    textArea.style.height = textLines.offsetHeight + 'px';
};

const scrollToLine = lineNum => {
    lineNum = (lineNum < 5) ? 0 : (lineNum - 5);
    const line = document.querySelectorAll('.text-line')[lineNum];
    setTimeout(() => {
        if (line) line.scrollIntoView();
    }, 300);
};

const rgbToHex = (rgb={}) => {
    const componentToHex = (c=0) => ('0' + c.toString(16)).substr(-2).toUpperCase();
    return "#" + componentToHex(rgb.red) + componentToHex(rgb.green) + componentToHex(rgb.blue);
}

const getStyleObject = textStyle => {
    const styleObj = {};
    if (textStyle.fontName) styleObj.fontFamily = textStyle.fontName;
    if (textStyle.fontPostScriptName) styleObj.fontFileFamily = textStyle.fontPostScriptName;
    if (textStyle.syntheticBold) styleObj.fontWeight = 'bold';
    if (textStyle.syntheticItalic) styleObj.fontStyle = 'italic';
    if (textStyle.fontCaps === 'allCaps') styleObj.textTransform = 'uppercase';
    if (textStyle.fontCaps === 'smallCaps') styleObj.textTransform = 'lowercase';
    if (textStyle.underline && (textStyle.underline !== 'underlineOff')) styleObj.textDecoration = 'underline';
    if (textStyle.strikethrough && (textStyle.strikethrough !== 'strikethroughOff')) {
        if (styleObj.textDecoration) styleObj.textDecoration += ' line-through';
        else styleObj.textDecoration = 'line-through'
    }
    return styleObj;
};




const App = React.memo(function App() {
    const [text, setText] = React.useState(readStorage('text') || '');
    const [styles, setStyles] = React.useState(readStorage('styles') || []);
    const [currentLineIndex, setCurrentLineIndex] = React.useState(readStorage('currentLineIndex') || 0);
    const [currentStyleId, setCurrentStyleId] = React.useState(readStorage('currentStyleId') || null);
    const [helpOpen, setHelpOpen] = React.useState(!readStorage('notFirstTime'));
    const [launched, setLaunched] = React.useState(false);
    const appBlock = React.useRef();
    const bottomBlock = React.useRef();

    const lines = text ? text.split('\n') : [];
    const currentText = lines[currentLineIndex]?.trim() || '';
    const currentStyle = styles.find(s => (s.id === currentStyleId));

    let dragging = false;
    let resizeStartY = 0;
    let resizeStartH = 0;
    const startBottomResize = e => {
        resizeStartH = bottomBlock.current.offsetHeight;
        resizeStartY = e.pageY;
        dragging = true;
    };
    const stopBottomResize = () => {
        dragging = false;
    };
    const moveBottomResize = e => {
        if (dragging) {
            e.preventDefault();
            const dy = e.pageY - resizeStartY;
            const newHeight = resizeStartH - dy;
            setBottomSize(newHeight);
        }
    };
    const setBottomSize = height => {
        const appHeight = document.documentElement.clientHeight;
        const maxBottomHeight = appHeight - topHeight - minMiddleHeight;
        let bottomHeight = height || readStorage('bottomHeight') || minBottomHeight;
        if (height < minBottomHeight) bottomHeight = minBottomHeight;
        else if (height > maxBottomHeight) bottomHeight = maxBottomHeight;
        bottomBlock.current.style.height = bottomHeight + 'px';
        writeToStorage({bottomHeight});
        resizeTextArea();
    };

    const getSetAppSizeFunc = () => {
        const func = () => {
            const appHeight = document.documentElement.clientHeight;
            appBlock.current.style.height = appHeight + 'px';
            setBottomSize();
        };
        window.lastSetAppSizeFunc = func;
        return func;
    };

    const prevLine = () => {
        for (let i = currentLineIndex - 1; i >= 0; i--) {
            if (lines[i]?.trim()) {
                setCurrentLineIndex(i);
                scrollToLine(i);
                break;
            }
        }
    };

    const nextLine = canStop => {
        let hasNextLine = false;
        for (let i = currentLineIndex + 1; i < lines.length; i++) {
            if (lines[i]?.trim()) {
                hasNextLine = true;
                setCurrentLineIndex(i);
                scrollToLine(i);
                break;
            }
        }
        if ((canStop === true) && launched && !hasNextLine) {
            setLaunched(false);
        }
    };

    const getCheckAndInsertFunc = () => {
        const func = () => {
            getActiveLayerData(layer => {
                if (allLayers[layer.docId]) {
                    const docLayers = allLayers[layer.docId];
                    if (!docLayers[layer.id]) {
                        if (launched && layer.isText) {
                            setActiveLayerText(currentText, currentStyle)
                            nextLine(true);
                        }
                        docLayers[layer.id] = 1;
                    }
                } else {
                    allLayers[layer.docId] = {};
                    getAllLayers();
                }
            });
        }
        window.lastCheckAndInsertFunc = func;
        return func;
    };

    csInterface.removeEventListener('documentEdited', window.lastCheckAndInsertFunc);
    csInterface.addEventListener('documentEdited', getCheckAndInsertFunc());

    window.removeEventListener('resize', window.lastSetAppSizeFunc);
    window.addEventListener('resize', getSetAppSizeFunc());

    React.useEffect(() => {
        getAllLayers();
        window.lastSetAppSizeFunc();
        if (currentText) {
            scrollToLine(currentLineIndex);
        } else if (lines.length) {
            let hasLine = false;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim()) {
                    setCurrentLineIndex(i);
                    scrollToLine(i);
                    hasLine = true;
                    break;
                }
            }
            if (!hasLine) {
                setCurrentLineIndex(0);
                setText('');
            }
        }
        if (!currentStyle) {
            setCurrentStyleId(styles[0]?.id || null);
        }
        if (helpOpen) {
            writeToStorage({notFirstTime: true});
        }
    }, []);
    
    React.useEffect(() => {resizeTextArea()}, [text]);
    React.useEffect(() => {writeToStorage({text})}, [text]);
    React.useEffect(() => {writeToStorage({styles})}, [styles]);
    React.useEffect(() => {writeToStorage({currentLineIndex})}, [currentLineIndex]);
    React.useEffect(() => {writeToStorage({currentStyleId})}, [currentStyleId]);

    return (
        <div className="app-body" ref={appBlock} onMouseMove={moveBottomResize} onMouseLeave={stopBottomResize} onMouseUp={stopBottomResize}>
            {helpOpen && (
                <HelpBlock setHelpOpen={setHelpOpen} />
            )}
            <div className="top-block" style={{height: topHeight}}>
                <TopBlock 
                    prevLine={prevLine}
                    nextLine={nextLine}
                    launched={launched} 
                    setHelpOpen={setHelpOpen}
                    setLaunched={setLaunched} 
                    currentText={currentText} 
                    currentStyle={currentStyle} 
                    currentLineIndex={currentLineIndex}
                />
            </div>
            <div className="top-divider hostBgdDark"></div>
            <div className="middle-block">
                <MiddleBlock 
                    text={text} 
                    setText={setText} 
                    currentLineIndex={currentLineIndex} 
                    setCurrentLineIndex={setCurrentLineIndex} 
                />
            </div>
            <div className="bottom-divider hostBgdDark" onMouseDown={startBottomResize}>
                <div className="hostBgdLight"></div>
            </div>
            <div className="bottom-block" ref={bottomBlock}>
                <BottomBlock 
                    styles={styles} 
                    setStyles={setStyles} 
                    currentStyleId={currentStyleId} 
                    setCurrentStyleId={setCurrentStyleId} 
                />
            </div>
        </div>
    );
});




const HelpBlock = React.memo(function HelpBlock(props) {
    return (
        <div className="help-block">
            <div className="help-hatch hostBgd"></div>
            <div className="help-block-inner hostBgdLight">
                <div className="help-header">
                    <div className="help-title">
                        {locale.helpTitle}
                    </div>
                    <button className="topcoat-icon-button--large--quiet" title={locale.closeHelp} onClick={() => props.setHelpOpen(false)}>
                        <FiX size={18} />
                    </button>
                </div>
                <div className="help-body">
                    <div className="help-body-inner" 
                        dangerouslySetInnerHTML = {
                            { __html: locale.helpText} 
                        }
                    ></div>
                </div>
                <div className="help-footer">
                    <b>{appTitle}</b> ({locale.version}: {appVersion}), {locale.author}: <span className="g-link" onClick={() => openUrl(authorUrl)}>{authorName}</span>
                </div>
            </div>
        </div>
    );
});
HelpBlock.propTypes = {
    setHelpOpen: PropTypes.func.isRequired
};




const TopBlock = React.memo(function TopBlock(props) {
    const textStyle = props.currentStyle?.text.layerText.textStyleRange[0]?.textStyle || {};
    const styleObject = getStyleObject(textStyle);
    return (
        <React.Fragment>
            <div className="header-top">
                <div className="header-button">
                    <button className={'topcoat-button--large--cta' + (props.launched ? ' m-launched' : '')} onClick={() => props.setLaunched(!props.launched)}>
                        {props.launched ? locale.stop : locale.launch}
                    </button>
                </div>
                <div className="header-actions">
                    <button className="topcoat-icon-button--large--quiet" title={locale.openHelp} onClick={() => props.setHelpOpen(true)}>
                        <FiHelpCircle size={18} />
                    </button>
                    <button className="topcoat-icon-button--large--quiet" title={locale.insertStyledText} onClick={() => setActiveLayerText(props.currentText, props.currentStyle)}>
                        <FiArrowRightCircle size={18} />
                    </button>
                </div>
            </div>
            <div className="header-bottom">
                <div className="header-nav">
                    <button className="topcoat-icon-button--large" title={locale.prevLine} onClick={props.prevLine}>
                        <FiArrowUp size={18} />
                    </button>
                    <button className="topcoat-icon-button--large" title={locale.nextLine} onClick={props.nextLine}>
                        <FiArrowDown size={18} />
                    </button>
                </div>
                <div className="header-current hostBgdDark" title={locale.scrollToLine} style={styleObject} onClick={() => scrollToLine(props.currentLineIndex)}
                    dangerouslySetInnerHTML = {
                        { __html: `<span style='font-family: "${styleObject.fontFamily || 'Tahoma'}"'>${props.currentText}</span>`} 
                    }
                ></div>
            </div>
        </React.Fragment>
    );
});
TopBlock.propTypes = {
    setHelpOpen: PropTypes.func.isRequired,
    setLaunched: PropTypes.func.isRequired,
    prevLine: PropTypes.func.isRequired,
    nextLine: PropTypes.func.isRequired,
    currentLineIndex: PropTypes.number,
    launched: PropTypes.bool,
    currentText: PropTypes.string,
    currentStyle: PropTypes.object,
};




const MiddleBlock = React.memo(function MiddleBlock(props) {
    const [focused, setFocused] = React.useState(false);
    const lines = props.text ? props.text.split('\n') : [];
    let lineCounter = 1;
    return (
        <React.Fragment>
            <div className="text-lines">
                {lines.map((line, i) => (
                    <div key={i} className={'text-line' + (line.trim() ? ' m-with-text' : ' m-empty') + ((props.currentLineIndex === i) ? ' m-current' : '')}>
                        <div className="text-line-num">
                            {line.trim() ? lineCounter++ : ' '}
                        </div>
                        <div className="text-line-select" title={line.trim() ? locale.selectLine : ' '}>
                            {line.trim() ? <FiTarget size={14} onClick={() => props.setCurrentLineIndex(i)} /> : ' '}
                        </div>
                        <div className="text-line-text">
                            {line || ' '}
                        </div>
                        <div className="text-line-insert" title={line.trim() ? locale.insertText : ' '}>
                            {line.trim() ? <FiArrowRightCircle size={14} onClick={() => setActiveLayerText(line)} /> : ' '}
                        </div>
                    </div>
                ))}
            </div>
            <textarea 
                className="text-area" 
                value={props.text} 
                onChange={e => props.setText(e.target.value)} 
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
            {!lines.length && !focused && (
                <div className="text-message">
                    <div>{locale.pasteTextHint}</div>
                </div>
            )}
        </React.Fragment>
    );
});
MiddleBlock.propTypes = {
    setCurrentLineIndex: PropTypes.func.isRequired,
    setText: PropTypes.func.isRequired,
    currentLineIndex: PropTypes.number,
    text: PropTypes.string
};




const BottomBlock = React.memo(function BottomBlock(props) {
    const [editorStyleId, setEditorStyleId] = React.useState(null);
    const [editorStyleName, setEditorStyleName] = React.useState('');
    const [editorStyleInfo, setEditorStyleInfo] = React.useState(null);
    const [editorNewStyle, setEditorNewStyle] = React.useState(false);

    const openStyle = id => {
        if (editorStyleId) return false;
        const style = props.styles.find(s => (s.id === id));
        if (style) {
            setEditorStyleName(style.name);
            setEditorStyleInfo({
                text: style.text,
                layer: style.layer
            });
            setEditorNewStyle(false);
            setEditorStyleId(id);
        } else {
            const newId = Math.random().toString(36).substr(2, 8);
            setEditorStyleName('');
            setEditorStyleInfo(null);
            setEditorNewStyle(true);
            setEditorStyleId(newId);
        }
    };

    const copyLayerStyle = () => {
        if (!editorStyleId) return false;
        getActiveLayerText(data => {
            if (!data.text.layerText?.textStyleRange.length) return false;
            const firstStyle = data.text.layerText.textStyleRange[0];
            const firstParag = data.text.layerText.paragraphStyleRange[0];
            firstStyle.to = 999999999;
            firstParag.to = 999999999;
            firstParag.paragraphStyle.burasagari = firstParag.paragraphStyle.burasagari || 'burasagariNone';
            firstParag.paragraphStyle.singleWordJustification = firstParag.paragraphStyle.singleWordJustification || 'justifyAll';
            firstParag.paragraphStyle.justificationMethodType = firstParag.paragraphStyle.justificationMethodType || 'justifMethodAutomatic';
            firstParag.paragraphStyle.textEveryLineComposer = !!firstParag.paragraphStyle.textEveryLineComposer;
            data.text.layerText.paragraphStyleRange = [firstParag];
            data.text.layerText.textStyleRange = [firstStyle];
            delete data.text.layerText.textKey;
            delete data.text.layerText.textShape;
            delete data.text.layerText.textClickPoint;
            delete data.text.layerText.transform;
            delete data.text.layerText.boundingBox;
            delete data.text.layerText.bounds;
            delete data.layer.layerEffects?.scale;
            setEditorStyleInfo(data);
        });
    };

    const saveStyle = () => {
        if (!editorStyleId) return false;
        if (!editorStyleName || !editorStyleInfo) {
            nativeAlert(locale.errorStyleCreation, locale.errorTitle, true);
            return false;
        }
        const styles = props.styles.concat([]);
        const newStyle = {
            id: editorStyleId,
            name: editorStyleName,
            text: editorStyleInfo.text,
            layer: editorStyleInfo.layer
        };
        if (!editorStyleId) {
            styles.push(newStyle);
        } else {
            const style = styles.find(s => (s.id === editorStyleId));
            if (style) Object.assign(style, newStyle);
            else styles.push(newStyle);
        }
        if (!props.currentStyleId) {
            props.setCurrentStyleId(editorStyleId);
        }
        props.setStyles(styles);
        setEditorStyleId(null);
    };

    const deleteStyle = () => {
        if (!editorStyleId) return false;
        nativeConfirm(locale.confirmDeleteStyle, locale.confirmTitle, ok => {
            if (!ok) return;
            if (props.currentStyleId === editorStyleId) {
                props.setCurrentStyleId(props.styles[0]?.id || null);
            } 
            const styles = props.styles.filter(s => (s.id !== editorStyleId));
            props.setStyles(styles);
            setEditorStyleId(null);
        });
    };

    const importStyles = () => {
        const pathSelect = window.cep.fs.showOpenDialogEx(false, false, null, null, ['json']);
        if (!pathSelect?.data?.[0]) return false;
        const result = window.cep.fs.readFile(pathSelect.data[0]);
        if (result.err) {
            nativeAlert(locale.errorImportStyles, locale.errorTitle, true);
        } else {
            try {
                const data = JSON.parse(result.data);
                if (!data?.styles || !Array.isArray(data.styles)) {
                    throw 'error';
                }
                if (data.styles.length) {
                    props.setCurrentStyleId(data.styles[0].id);
                }
                props.setStyles(data.styles);
            } catch (error) {
                nativeAlert(locale.errorImportStyles, locale.errorTitle, true);
            }
        }
    };

    const exportStyles = () => {
        if (!props.styles.length) return;
        const pathSelect = window.cep.fs.showSaveDialogEx(false, false, ['json'], exportFileName + '.json');
        if (!pathSelect?.data) return false;
        window.cep.fs.writeFile(pathSelect.data, JSON.stringify({styles: props.styles}));
    };

    return !editorStyleId ? (
        <React.Fragment>
            <div className="styles-list-cont">
                {props.styles.length ? (
                    <ReactSortable className="styles-list" list={props.styles} setList={props.setStyles}>
                        {props.styles.map(style => (
                            <StyleItem 
                                key={style.id} 
                                active={props.currentStyleId === style.id}
                                selectStyle={() => props.setCurrentStyleId(style.id)}
                                openStyle={() => openStyle(style.id)}
                                style={style}
                            />
                        ))}
                    </ReactSortable >
                ) : (
                    <div className="styles-empty">
                        <span>{locale.addStylesHint}</span>
                    </div>
                )}
            </div>
            <div className="style-add">
                <button className="style-add-btn topcoat-button--large" onClick={() => openStyle(null)}>
                    <FiPlus size={18} /> {locale.add}
                </button>
                <button className="topcoat-icon-button--large--quiet" title={locale.import} onClick={importStyles}>
                    <FaFileImport size={18} />
                </button>
                <button className="topcoat-icon-button--large--quiet" title={locale.export} disabled={!props.styles.length} onClick={exportStyles}>
                    <FaFileExport size={18} />
                </button>
            </div>
        </React.Fragment>
    ) : (
        <StyleEdit 
            setEditorStyleId={setEditorStyleId}
            editorNewStyle={editorNewStyle}
            editorStyleName={editorStyleName}
            setEditorStyleName={setEditorStyleName}
            copyLayerStyle={copyLayerStyle}
            editorStyleInfo={editorStyleInfo}
            saveStyle={saveStyle}
            deleteStyle={deleteStyle}
        />
    );
});
BottomBlock.propTypes = {
    setCurrentStyleId: PropTypes.func.isRequired,
    setStyles: PropTypes.func.isRequired,
    currentStyleId: PropTypes.string,
    styles: PropTypes.array
};


const StyleItem = React.memo(function StyleItem(props) {
    const openStyle = e => {
        e.stopPropagation();
        props.openStyle();
    };
    const insertStyle = e => {
        e.stopPropagation();
        setActiveLayerText('', props.style)
    };
    const textStyle = props.style.text.layerText.textStyleRange[0]?.textStyle || {};
    const styleObject = getStyleObject(textStyle);
    return (
        <div className={'style-item hostBgdLight' + (props.active ? ' m-current' : '')} onClick={props.selectStyle}>
            <div className="style-color" style={{background: rgbToHex(textStyle.color)}} title={rgbToHex(textStyle.color)}></div>
            <div className="style-name" style={styleObject}
                dangerouslySetInnerHTML = {
                    { __html: `<span style='font-family: "${styleObject.fontFamily || 'Tahoma'}"'>${props.style.name}</span>`} 
                }
            ></div>
            <div className="style-actions">
                <button className="topcoat-icon-button--large--quiet" title={locale.editStyle} onClick={openStyle}>
                    <MdEdit size={16} />
                </button>
                <button className="topcoat-icon-button--large--quiet" title={locale.insertStyle} onClick={insertStyle}>
                    <FiArrowRightCircle size={16} />
                </button>
            </div>
        </div>
    );
});
StyleItem.propTypes = {
    selectStyle: PropTypes.func.isRequired,
    openStyle: PropTypes.func.isRequired,
    style: PropTypes.object.isRequired,
    active: PropTypes.bool
};


const StyleEdit = React.memo(function StyleEdit(props) {
    const nameInputRef = React.useRef();
    React.useEffect(() => {
        if (nameInputRef.current) nameInputRef.current.focus();
    }, []);
    return (
        <form className="style-edit hostBgdLight" onSubmit={props.saveStyle}>
            <div className="style-edit-header">
                <div className="style-edit-title">
                    {props.editorNewStyle ? locale.styleCreateTile : locale.styleEditTitle}
                </div>
                <button type="button" className="topcoat-icon-button--large--quiet" title={locale.cancelStyleEdit} onClick={() => props.setEditorStyleId(null)}>
                    <FiX size={18} />
                </button>
            </div>
            <div className="style-edit-name">
                <div className="style-edit-name-title">{locale.styleNameLabel}</div>
                <input type="text" className="topcoat-text-input--large" ref={nameInputRef} value={props.editorStyleName} onChange={e => props.setEditorStyleName(e.target.value)} />
            </div>
            <div className="style-edit-copy">
                <div className="style-edit-copy-title">{locale.styleCopyLabel}</div>
                <button type="button" className="style-edit-copy-btn topcoat-button--large" onClick={props.copyLayerStyle}>
                    <FiCopy size={18} /> {locale.styleCopyButton}
                </button>
                <div className="style-edit-info">
                    {props.editorStyleInfo ? (
                        <StyleInfo style={props.editorStyleInfo} />
                    ) : (
                        <div className="style-edit-empty-info">{locale.styleNotCopied}</div>
                    )}
                </div>
            </div>
            <div className="style-edit-actions">
                <button type="submit" className="topcoat-button--large--cta">
                    <MdSave size={18} /> {locale.save}
                </button>
                {!props.editorNewStyle && (
                    <button type="button" className="topcoat-button--large--quiet" onClick={props.deleteStyle}>
                        <MdDelete size={18} /> {locale.delete}
                    </button>
                )}
            </div>
        </form>
    );
});
StyleEdit.propTypes = {
    setEditorStyleId: PropTypes.func.isRequired,
    setEditorStyleName: PropTypes.func.isRequired,
    copyLayerStyle: PropTypes.func.isRequired,
    deleteStyle: PropTypes.func.isRequired,
    saveStyle: PropTypes.func.isRequired,
    editorStyleName: PropTypes.string,
    editorStyleInfo: PropTypes.object,
    editorNewStyle: PropTypes.bool
};


const StyleInfo = React.memo(function StyleInfo(props) {
    const text = props.style.text;
    const layer = props.style.layer;
    const unit = text.typeUnit.substr(0, 3);
    const textStyle = text.layerText.textStyleRange[0].textStyle;
    return (
        <React.Fragment>
            {textStyle.fontName}
            , {textStyle.size + unit}
            {!!textStyle.leading && ('/' + textStyle.leading + unit)}
            {!!textStyle.tracking && (' (' + (textStyle.tracking > 0 ? '+' : '') + textStyle.tracking +')')}
            {(textStyle.autoKern === 'opticalKern') && (', optical')}
            {((textStyle.verticalScale && (textStyle.verticalScale !== 100)) || (textStyle.horizontalScale && (textStyle.horizontalScale !== 100))) && (
                ', ' + (textStyle.verticalScale ? parseInt(textStyle.verticalScale) : '100') + '%/' + (textStyle.horizontalScale ? parseInt(textStyle.horizontalScale) : '100') + '%'
            )}
            {!!textStyle.baselineShift && (' [' + (textStyle.baselineShift > 0 ? '+' : '') + textStyle.baselineShift + unit + ']')}
            , {rgbToHex(textStyle.color)}
            {!!textStyle.syntheticBold && (', bold')}
            {!!textStyle.syntheticItalic && (', italic')}
            {(textStyle.fontCaps === 'allCaps') && (', CAPS')}
            {(textStyle.fontCaps === 'smallCaps') && (', small')}
            {(textStyle.underline && (textStyle.underline !== 'underlineOff')) && (', _u_')}
            {(textStyle.strikethrough && (textStyle.strikethrough !== 'strikethroughOff')) && (', -s-')}
            , {text.layerText.antiAlias.replace('antiAlias', '')}
            {!!layer.layerEffects && (', Layer Effects')}
            ...
        </React.Fragment>
    );
});
StyleInfo.propTypes = {
    style: PropTypes.object.isRequired
};


ReactDOM.render(<App />, document.getElementById('app'));