import './previewBlock.scss';

import _ from 'lodash';
import React from 'react';
import {FiArrowRightCircle, FiPlusCircle, FiMinusCircle, FiArrowUp, FiArrowDown} from "react-icons/fi";
import {AiOutlineBorderInner} from "react-icons/ai";
import {MdCenterFocusWeak} from "react-icons/md";

import {locale, setActiveLayerText, createTextLayerInSelection, alignTextLayerToSelection, getStyleObject, scrollToLine} from '../../utils';
import {useContext} from '../../context';


const PreviewBlock = React.memo(function PreviewBlock() {
    const context = useContext();
    const line = context.state.currentLine || {};
    const style = context.state.currentStyle || {};
    const textStyle = style.textProps?.layerText.textStyleRange[0].textStyle || {};
    const styleObject = getStyleObject(textStyle);
    const sizeInputRef = React.useRef();

    const createLayer = () => {
        let lineStyle = context.state.currentStyle;
        if (lineStyle && context.state.currentFontSize) {
            lineStyle = _.cloneDeep(lineStyle);
            lineStyle.textProps.layerText.textStyleRange[0].textStyle.size = context.state.currentFontSize;
        }
        const pointText = context.state.pastePointText;
        createTextLayerInSelection((line.text || ''), lineStyle, pointText, ok => {
            if (ok) context.dispatch({type: 'nextLine'});
        });
    };

    const insertStyledText = () => {
        let lineStyle = context.state.currentStyle;
        if (lineStyle && context.state.currentFontSize) {
            lineStyle = _.cloneDeep(lineStyle);
            lineStyle.textProps.layerText.textStyleRange[0].textStyle.size = context.state.currentFontSize;
        }
        setActiveLayerText((line.text || ''), lineStyle, ok => {
            if (ok) context.dispatch({type: 'nextLine'});
        });
    };

    const currentLineClick = () => {
        scrollToLine(line.rawIndex);
        sizeInputRef.current.focus();
    };

    const setCurrentSize = size => {
        const currentSize = context.state.currentFontSize || textStyle.size || 14;
        if (size === '+1') {
            size = currentSize + 1;
        } else if (size === '-1') {
            size = (currentSize > 1) ? (currentSize - 1) : size;
        } else if (size === '') {
            size = null;
        } else {
            size = Number(size) || null;
        }
        context.dispatch({type: 'setCurrentFontSize', size});
    };

    React.useEffect(() => {
        if (textStyle.size) setCurrentSize(textStyle.size);
    }, [style.id]);

    return (
        <React.Fragment>
            <div className="preview-top">
                <button className="topcoat-button--large--cta" title={locale.createLayerDescr} onClick={createLayer}>
                    <AiOutlineBorderInner size={18} /> {locale.createLayer}
                </button>
                <button className="topcoat-button--large" title={locale.alignLayerDescr} onClick={() => alignTextLayerToSelection()}>
                    <MdCenterFocusWeak size={18} /> {locale.alignLayer}
                </button>
            </div>
            <div className="preview-bottom">
                <div className="preview-nav">
                    <button className="topcoat-icon-button--large" title={locale.prevLine} onClick={() => context.dispatch({type: 'prevLine'})}>
                        <FiArrowUp size={18} />
                    </button>
                    <button className="topcoat-icon-button--large" title={locale.nextLine} onClick={() => context.dispatch({type: 'nextLine'})}>
                        <FiArrowDown size={18} />
                    </button>
                </div>
                <div className="preview-current hostBgdDark" title={locale.scrollToLine} onClick={currentLineClick}>
                    <div className="preview-line-info">
                        <div className="preview-line-info-text">
                            {locale.previewLine}: <b>{line.index || '—'}</b>
                            , {locale.previewStyle}: <b className="preview-line-style-name">{style.name || '—'}</b>
                            , {locale.previewSize}: 
                            <div className="preview-line-size">
                                <span title={locale.previewSizeMinus}>
                                    <FiMinusCircle size={16} onClick={() => setCurrentSize('-1')} />
                                </span>
                                <input 
                                    min={1} 
                                    type="number" 
                                    placeholder={textStyle.size || ''}
                                    value={context.state.currentFontSize || ''} 
                                    onChange={e => setCurrentSize(e.target.value)} 
                                    className="topcoat-text-input"
                                    ref={sizeInputRef}
                                />
                                <span title={locale.previewSizePlus}>
                                    <FiPlusCircle size={16} onClick={() => setCurrentSize('+1')} />
                                </span>
                            </div>
                        </div>
                        <div className="preview-line-info-actions" title={locale.insertStyledText}>
                            <FiArrowRightCircle size={16} onClick={insertStyledText} />
                        </div>
                    </div>
                    <div className="preview-line-text" style={styleObject}
                        dangerouslySetInnerHTML = {
                            { __html: `<span style='font-family: "${styleObject.fontFamily || 'Tahoma'}"'>${line.text || ''}</span>`} 
                        }
                    ></div>
                </div>
            </div>
        </React.Fragment>
    );
});

export default PreviewBlock;