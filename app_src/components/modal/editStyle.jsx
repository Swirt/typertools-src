import './editStyle.scss';

import React from 'react';
import PropTypes from 'prop-types';
import {FiCopy, FiX} from "react-icons/fi";
import {MdDelete, MdSave} from "react-icons/md";
import {SketchPicker} from 'react-color';

import config from '../../config';
import {locale, nativeAlert, nativeConfirm, getActiveLayerText, rgbToHex} from '../../utils';
import {useContext} from '../../context';


const EditStyleModal = React.memo(function EditStyleModal() {
    const context = useContext();
    const currentData = context.state.modalData;
    const [name, setName] = React.useState(currentData.name || '');
    const [textProps, setTextProps] = React.useState(currentData.textProps || null);
    const [prefixes, setPrefixes] = React.useState(currentData.prefixes?.join(' ') || '');
    const [prefixColor, setPrefixColor] = React.useState(currentData.prefixColor || config.defaultPrefixColor);
    const [colorPickerOpen, setColorPickerOpen] = React.useState(false);
    const [edited, setEdited] = React.useState(false);
    const nameInputRef = React.useRef();

    const close = () => {
        context.dispatch({type: 'setModal'});
    };

    const changeStyleName = e => {
        setName(e.target.value);
        setEdited(true);
    };

    const copyLayerStyle = () => {
        getActiveLayerText(data => {
            if (!data.textProps.layerText?.textStyleRange.length) return false;
            if (!data.textProps.layerText?.paragraphStyleRange.length) return false;
            const firstTextStyle = data.textProps.layerText.textStyleRange[0];
            const firstParStyle = data.textProps.layerText.paragraphStyleRange[0];
            firstParStyle.paragraphStyle.burasagari = firstParStyle.paragraphStyle.burasagari || 'burasagariNone';
            firstParStyle.paragraphStyle.singleWordJustification = firstParStyle.paragraphStyle.singleWordJustification || 'justifyAll';
            firstParStyle.paragraphStyle.justificationMethodType = firstParStyle.paragraphStyle.justificationMethodType || 'justifMethodAutomatic';
            firstParStyle.paragraphStyle.textEveryLineComposer = !!firstParStyle.paragraphStyle.textEveryLineComposer;
            data.textProps.layerText.paragraphStyleRange = [firstParStyle];
            data.textProps.layerText.textStyleRange = [firstTextStyle];
            delete data.textProps.layerText.textKey;
            delete data.textProps.layerText.textShape;
            delete data.textProps.layerText.textClickPoint;
            delete data.textProps.layerText.transform;
            delete data.textProps.layerText.boundingBox;
            delete data.textProps.layerText.bounds;
            setTextProps(data.textProps);
            setEdited(true);
        });
    };

    const changePrefixes = e => {
        setPrefixes(e.target.value);
        setEdited(true);
    };

    const changePrefixColor = e => {
        setPrefixColor(e.hex);
        setEdited(true);
    };

    const saveStyle = e => {
        e.preventDefault();
        if (!name || !textProps) {
            nativeAlert(locale.errorStyleCreation, locale.errorTitle, true);
            return false;
        }
        const data = {name, textProps, prefixes, prefixColor};
        if (currentData.create) {
            data.id = Math.random().toString(36).substr(2, 8);
        } else {
            data.id = currentData.id;
        }
        context.dispatch({type: 'saveStyle', data});
        close();
    };

    const deleteStyle = e => {
        e.preventDefault();
        if (!currentData.id) return;
        nativeConfirm(locale.confirmDeleteStyle, locale.confirmTitle, ok => {
            if (!ok) return;
            context.dispatch({type: 'deleteStyle', id: currentData.id});
            close();
        });
    };

    React.useEffect(() => {
        if (nameInputRef.current) nameInputRef.current.focus();
    }, []);
    
    return (
        <React.Fragment>
            <div className="app-modal-header hostBrdBotContrast">
                <div className="app-modal-title">
                    {currentData.create ? locale.createStyleTitle : locale.editStyleTitle}
                </div>
                <button className="topcoat-icon-button--large--quiet" title={locale.close} onClick={close}>
                    <FiX size={18} />
                </button>
            </div>
            <div className="app-modal-body">
                <form className="app-modal-body-inner" onSubmit={saveStyle}>
                    <div className="fields">
                        <div className="field">
                            <div className="field-label">
                                {locale.editStyleNameLabel}
                            </div>
                            <div className="field-input">
                                <input 
                                    type="text" 
                                    ref={nameInputRef} 
                                    value={name} 
                                    onChange={changeStyleName} 
                                    className="topcoat-text-input--large"
                                />
                            </div>
                        </div>
                        <div className="field hostBrdTopContrast">
                            <div className="field-label">
                                {locale.editStyleCopyLabel}
                            </div>
                            <button type="button" className="style-edit-copy-btn topcoat-button--large" onClick={copyLayerStyle}>
                                <FiCopy size={18} /> {locale.editStyleCopyButton}
                            </button>
                            {textProps ? (
                                <StyleDetails style={{textProps}} />
                            ) : (
                                <div className="field-descr">
                                    {locale.editStyleCopyDescr}
                                </div>
                            )}
                        </div>
                        {!!textProps && (
                            <div className="field hostBrdTopContrast">
                                <div className="field-label">
                                    {locale.editStylePrefixesLabel}
                                </div>
                                <div className="field-input">
                                    <textarea 
                                        rows={2}
                                        value={prefixes} 
                                        onChange={changePrefixes}
                                        className="topcoat-textarea"
                                    />
                                </div>
                                <div className="field-descr">
                                    {locale.editStylePrefixesDescr}
                                </div>
                            </div>
                        )}
                        {!!textProps && (
                            <div className="field hostBrdTopContrast">
                                <div className="field-label">
                                    {locale.editStylePrefixColorLabel}
                                </div>
                                <div className="field-input">
                                    <div className="style-edit-prefix-color">
                                        {colorPickerOpen && (
                                            <React.Fragment>
                                                <div className="color-picker-overlay" onClick={() => setColorPickerOpen(false)}></div>
                                                <SketchPicker 
                                                    disableAlpha={true}
                                                    color={prefixColor} 
                                                    onChange={changePrefixColor}
                                                    presetColors={['#FFA6A4', '#FDD4BB', '#FFF3B0', '#CDFDD3', '#BEDADC', '#C2F2FF', '#C3C9FF', '#F6D5FF']}
                                                />
                                            </React.Fragment>
                                        )}
                                        <div className="style-edit-color-sample" title={locale.editStylePrefixColorButton} onClick={() => setColorPickerOpen(true)}>
                                            <div style={{background: prefixColor}}></div>
                                            <span>{prefixColor}</span>
                                        </div> 
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="fields style-edit-actions hostBrdTopContrast">
                        <button type="submit" className={edited ? 'topcoat-button--large--cta' : 'topcoat-button--large'}>
                            <MdSave size={18} /> {locale.save}
                        </button>
                        {!currentData.create && (
                            <button type="button" className="topcoat-button--large--quiet" onClick={deleteStyle}>
                                <MdDelete size={18} /> {locale.delete}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </React.Fragment>
    );
});


const StyleDetails = React.memo(function StyleDetails(props) {
    const unit = props.style.textProps.typeUnit.substr(0, 3);
    const textStyle = props.style.textProps.layerText.textStyleRange[0].textStyle;
    const warpStyle = props.style.textProps.layerText.warp.warpStyle || 'warpNone';
    return (
        <div className="style-edit-details">
            {textStyle.fontName}
            , {textStyle.size + unit}
            {!!textStyle.leading && ('/' + textStyle.leading + unit)}
            {!!textStyle.tracking && (' (' + (textStyle.tracking > 0 ? '+' : '') + textStyle.tracking +')')}
            {(textStyle.autoKern === 'opticalKern') && (', optical')}
            {((textStyle.verticalScale && (textStyle.verticalScale !== 100)) || (textStyle.horizontalScale && (textStyle.horizontalScale !== 100))) && (
                ', ' + (textStyle.verticalScale ? Math.round(textStyle.verticalScale) : '100') + '%/' + (textStyle.horizontalScale ? Math.round(textStyle.horizontalScale) : '100') + '%'
            )}
            {!!textStyle.baselineShift && (' [' + (textStyle.baselineShift > 0 ? '+' : '') + textStyle.baselineShift + unit + ']')}
            , {rgbToHex(textStyle.color)}
            {!!textStyle.syntheticBold && (', bold')}
            {!!textStyle.syntheticItalic && (', italic')}
            {(textStyle.fontCaps === 'allCaps') && (', CAPS')}
            {(textStyle.fontCaps === 'smallCaps') && (', small')}
            {(textStyle.underline && (textStyle.underline !== 'underlineOff')) && (', _u_')}
            {(textStyle.strikethrough && (textStyle.strikethrough !== 'strikethroughOff')) && (', -s-')}
            , {props.style.textProps.layerText.antiAlias.replace('antiAlias', '')}
            {(warpStyle !== 'warpNone') && (', ' + warpStyle)}
            ...
        </div>
    );
});
StyleDetails.propTypes = {
    style: PropTypes.object.isRequired
};

export default EditStyleModal;