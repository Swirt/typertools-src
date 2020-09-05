import React from 'react';
import {FiX} from "react-icons/fi";
import {MdSave} from "react-icons/md";
import {FaFileExport, FaFileImport} from "react-icons/fa";

import config from '../../config';
import {locale, nativeAlert} from '../../utils';
import {useContext} from '../../context';


const SettingsModal = React.memo(function SettingsModal() {
    const context = useContext();
    const [pastePointText, setPastePointText] = React.useState(context.state.pastePointText ? '1' : '');
    const [ignoreLinePrefixes, setIgnoreLinePrefixes] = React.useState(context.state.ignoreLinePrefixes.join(' '));
    const [defaultStyleId, setDefaultStyleId] = React.useState(context.state.defaultStyleId || '');
    const [edited, setEdited] = React.useState(false);

    const close = () => {
        context.dispatch({type: 'setModal'});
    };

    const changePastePointText = e => {
        setPastePointText(e.target.value);
        setEdited(true);
    };

    const changeLinePrefixes = e => {
        setIgnoreLinePrefixes(e.target.value);
        setEdited(true);
    };

    const changeDefaultStyle = e => {
        setDefaultStyleId(e.target.value);
        setEdited(true);
    };

    const save = e => {
        e.preventDefault();
        if (pastePointText !== context.state.pastePointText) {
            context.dispatch({
                type: 'setPastePointText',
                isPoint: !!pastePointText
            });
        }
        if (ignoreLinePrefixes !== context.state.ignoreLinePrefixes.join(' ')) {
            context.dispatch({
                type: 'setIgnoreLinePrefixes',
                data: ignoreLinePrefixes
            });
        }
        if (defaultStyleId !== context.state.defaultStyleId) {
            context.dispatch({
                type: 'setDefaultStyleId',
                id: defaultStyleId
            });
        }
        context.dispatch({type: 'setModal'});
    };

    const importSettings = () => {
        const pathSelect = window.cep.fs.showOpenDialogEx(false, false, null, null, ['json']);
        if (!pathSelect?.data?.[0]) return false;
        const result = window.cep.fs.readFile(pathSelect.data[0]);
        if (result.err) {
            nativeAlert(locale.errorImportStyles, locale.errorTitle, true);
        } else {
            try {
                const data = JSON.parse(result.data);
                context.dispatch({type: 'import', data});
                close();
            } catch (error) {
                nativeAlert(locale.errorImportStyles, locale.errorTitle, true);
            }
        }
    };

    const exportSettings = () => {
        const pathSelect = window.cep.fs.showSaveDialogEx(false, false, ['json'], config.exportFileName + '.json');
        if (!pathSelect?.data) return false;
        window.cep.fs.writeFile(pathSelect.data, JSON.stringify({
            ignoreLinePrefixes: context.state.ignoreLinePrefixes,
            defaultStyleId: context.state.defaultStyleId,
            textItemKind: context.state.setTextItemKind,
            folders: context.state.folders,
            styles: context.state.styles,
            version: config.appVersion,
            exported: new Date()
        }));
    };

    return (
        <React.Fragment>
            <div className="app-modal-header hostBrdBotContrast">
                <div className="app-modal-title">
                    {locale.settingsTitle}
                </div>
                <button className="topcoat-icon-button--large--quiet" title={locale.close} onClick={close}>
                    <FiX size={18} />
                </button>
            </div>
            <div className="app-modal-body">
                <div className="app-modal-body-inner">
                    <form className="fields" onSubmit={save}>
                        <div className="field">
                            <div className="field-label">
                                {locale.settingsTextItemKindLabel}
                            </div>
                            <div className="field-input">
                                <select 
                                    value={pastePointText} 
                                    onChange={changePastePointText}
                                    className="topcoat-textarea"
                                >
                                    <option value="">{locale.settingsTextItemKindBox}</option>
                                    <option value="1">{locale.settingsTextItemKindPoint}</option>
                                    
                                </select>
                            </div>
                        </div>
                        <div className="field hostBrdTopContrast">
                            <div className="field-label">
                                {locale.settingsLinePrefixesLabel}
                            </div>
                            <div className="field-input">
                                <textarea 
                                    rows={2}
                                    value={ignoreLinePrefixes} 
                                    onChange={changeLinePrefixes}
                                    className="topcoat-textarea"
                                />
                            </div>
                            <div className="field-descr">
                                {locale.settingsLinePrefixesDescr}
                            </div>
                        </div>
                        <div className="field hostBrdTopContrast">
                            <div className="field-label">
                                {locale.settingsDefaultStyleLabel}
                            </div>
                            <div className="field-input">
                                <select 
                                    value={defaultStyleId} 
                                    onChange={changeDefaultStyle}
                                    className="topcoat-textarea"
                                >
                                    <option key="none" value="">{locale.settingsDefaultStyleNone}</option>
                                    {context.state.styles.map(style => (
                                        <option key={style.id} value={style.id}>{style.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field-descr">
                                {locale.settingsDefaultStyleDescr}
                            </div>
                        </div>
                        <div className="field hostBrdTopContrast">
                            <button type="submit" className={edited ? 'topcoat-button--large--cta' : 'topcoat-button--large'}>
                                <MdSave size={18} /> {locale.save}
                            </button>
                        </div>
                    </form>
                    <div className="fields hostBrdTopContrast">
                        <div className="field">
                            <button className="topcoat-button--large" onClick={importSettings}>
                                <FaFileImport size={18} /> {locale.settingsImport}
                            </button>
                        </div>
                        <div className="field">
                            <button className="topcoat-button--large" onClick={exportSettings}>
                                <FaFileExport size={18} /> {locale.settingsExport}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
});

export default SettingsModal;