import React from 'react';
import {FiX} from "react-icons/fi";
import {MdSave} from "react-icons/md";
import {FaFileExport, FaFileImport} from "react-icons/fa";

import config from '../../config';
import {locale, nativeAlert} from '../../utils';
import {useContext} from '../../context';


const SettingsModal = React.memo(function SettingsModal() {
    const context = useContext();
    const [ignoreLinePrefixes, setIgnoreLinePrefixes] = React.useState(context.state.ignoreLinePrefixes.join(' '));
    const [edited, setEdited] = React.useState(false);

    const close = () => {
        context.dispatch({type: 'setModal'});
    };

    const changeLinePrefixes = e => {
        setIgnoreLinePrefixes(e.target.value);
        setEdited(true);
    };

    const save = e => {
        e.preventDefault();
        context.dispatch({
            type: 'setIgnoreLinePrefixes',
            data: ignoreLinePrefixes
        });
        setEdited(false);
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
                if (data.ignoreLinePrefixes) {
                    setIgnoreLinePrefixes(data.ignoreLinePrefixes.join(' '));
                }
                setEdited(false);
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
            styles: context.state.styles
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
                        <div className="field">
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