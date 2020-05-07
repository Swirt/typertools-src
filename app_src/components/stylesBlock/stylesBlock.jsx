import './stylesBlock.scss';

import React from 'react';
import PropTypes from 'prop-types';
import {ReactSortable} from "react-sortablejs";
import {FiArrowRightCircle, FiPlus} from "react-icons/fi";
import {MdEdit} from "react-icons/md";

import {locale, setActiveLayerText, rgbToHex, getStyleObject} from '../../utils';
import {useContext} from '../../context';


const StylesBlock = React.memo(function StylesBlock() {
    const context = useContext();
    
    return (
        <React.Fragment>
            <div className="styles-list-cont">
                {context.state.styles.length ? (
                    <ReactSortable className="styles-list" list={context.state.styles} setList={data => context.dispatch({type: 'setStyles', data})}>
                        {context.state.styles.map(style => (
                            <StyleItem 
                                key={style.id} 
                                active={context.state.currentStyleId === style.id}
                                selectStyle={() => context.dispatch({type: 'setCurrentStyleId', id: style.id})}
                                openStyle={() => context.dispatch({type: 'setModal', modal: 'editStyle', data: style})}
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
            <div className="style-add hostBrdTopContrast">
                <button className="topcoat-button--large" onClick={() => context.dispatch({type: 'setModal', modal: 'editStyle', data: {create: true}})}>
                    <FiPlus size={18} /> {locale.addStyle}
                </button>
            </div>
        </React.Fragment>
    );
});


const StyleItem = React.memo(function StyleItem(props) {
    const openStyle = e => {
        e.stopPropagation();
        props.openStyle();
    };
    const insertStyle = e => {
        e.stopPropagation();
        setActiveLayerText('', props.style)
    };
    const textStyle = props.style.textProps.layerText.textStyleRange[0]?.textStyle || {};
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
                <button className={'topcoat-icon-button--large--quiet' + (props.active ? ' m-cta' : '')} title={locale.editStyle} onClick={openStyle}>
                    <MdEdit size={16} />
                </button>
                <button className={'topcoat-icon-button--large--quiet' + (props.active ? ' m-cta' : '')} title={locale.insertStyle} onClick={insertStyle}>
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

export default StylesBlock;