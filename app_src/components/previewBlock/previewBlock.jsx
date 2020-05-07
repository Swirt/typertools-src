import './previewBlock.scss';

import React from 'react';
import {FiArrowRightCircle, FiArrowUp, FiArrowDown} from "react-icons/fi";
import {AiOutlineBorderInner} from "react-icons/ai";
import {MdCenterFocusWeak} from "react-icons/md";

import {locale, setActiveLayerText, createTextLayerInSelection, alignTextLayerToSelection, rgbToHex, getStyleObject, scrollToLine} from '../../utils';
import {useContext} from '../../context';


const PreviewBlock = React.memo(function PreviewBlock() {
    const context = useContext();
    const line = context.state.currentLine || {};
    const style = context.state.currentStyle || {};
    const textStyle = style.textProps?.layerText.textStyleRange[0]?.textStyle || {};
    const styleObject = getStyleObject(textStyle);

    const createLayer = () => {
        createTextLayerInSelection((line.text || ''), context.state.currentStyle, ok => {
            if (ok) context.dispatch({type: 'nextLine'});
        });
    };

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
                <div className="preview-current hostBgdDark" title={locale.scrollToLine} onClick={() => scrollToLine(line.rawIndex)}>
                    <div className="preview-line-info">
                        <div className="preview-line-info-text">
                            {locale.previewLine}: <b>{line.index || '—'}</b>, {locale.previewStyle}: <b className="preview-line-style-name">{style.name || '—'}</b>
                            <span className="preview-line-info-color" style={{background: rgbToHex(textStyle.color)}} title={rgbToHex(textStyle.color)}></span>
                        </div>
                        <div className="preview-line-info-actions" title={locale.insertStyledText}>
                            <FiArrowRightCircle size={16} onClick={() => setActiveLayerText((line.text || ''), context.state.currentStyle)} />
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