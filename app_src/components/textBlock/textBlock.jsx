import './textBlock.scss';

import React from 'react';
import {FiArrowRightCircle, FiTarget} from "react-icons/fi";

import config from '../../config';
import {locale, setActiveLayerText, resizeTextArea, scrollToLine} from '../../utils';
import {useContext} from '../../context';


const TextBlock = React.memo(function TextBlock() {
    const context = useContext();
    const [focused, setFocused] = React.useState(false);
    React.useEffect(resizeTextArea);
    React.useEffect(() => {
        scrollToLine(context.state.currentLineIndex, 600);
    }, []);
    return (
        <React.Fragment>
            <div className="text-lines">
                {context.state.lines.map(line => (
                    <div key={line.rawIndex} className={'text-line' + (line.ignore ? ' m-empty' : '') + ((context.state.currentLineIndex === line.rawIndex) ? ' m-current' : '')}>
                        <div className="text-line-num">
                            {line.ignore ? ' ' : line.index}
                        </div>
                        <div className="text-line-select" title={line.ignore ? '' : locale.selectLine}>
                            {line.ignore ? ' ' : <FiTarget size={14} onClick={() => context.dispatch({type: 'setCurrentLineIndex', index: line.rawIndex})} />}
                        </div>
                        <div className="text-line-text">
                            {line.ignorePrefix ? (
                                <React.Fragment>
                                    <span className="text-line-ignore-prefix">{line.ignorePrefix}</span>
                                    <span>{line.rawText.replace(line.ignorePrefix, '')}</span>
                                </React.Fragment>
                            ) : line.stylePrefix ? (
                                <React.Fragment>
                                    <span className="text-line-style-prefix" style={{background: line.style?.prefixColor || config.defaultPrefixColor}}>{line.stylePrefix}</span>
                                    <span>{line.rawText.replace(line.stylePrefix, '')}</span>
                                </React.Fragment>
                            ) : (
                                <span>{line.rawText || ' '}</span>
                            )}
                        </div>
                        <div className="text-line-insert" title={line.ignore ? '' : locale.insertText}>
                            {line.ignore ? ' ' : <FiArrowRightCircle size={14} onClick={() => setActiveLayerText(line.text)} />}
                        </div>
                    </div>
                ))}
            </div>
            <textarea 
                className="text-area" 
                value={context.state.text} 
                onChange={e => context.dispatch({type: 'setText', text: e.target.value})} 
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
            {!context.state.lines.length && !focused && (
                <div className="text-message">
                    <div>{locale.pasteTextHint}</div>
                </div>
            )}
        </React.Fragment>
    );
});

export default TextBlock;