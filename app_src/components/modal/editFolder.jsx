import './editFolder.scss';

import React from 'react';
import PropTypes from 'prop-types';
import {FiX} from "react-icons/fi";
import {MdDelete, MdCancel, MdSave} from "react-icons/md";

import {locale, nativeAlert, nativeConfirm} from '../../utils';
import {useContext} from '../../context';


const EditFolderModal = React.memo(function EditFolderModal() {
    const context = useContext();
    const currentData = context.state.modalData;
    const folderStyleIds = currentData.id ? context.state.styles.filter(s => (s.folder === currentData.id)).map(s => s.id) : [];
    const [name, setName] = React.useState(currentData.name || '');
    const [styleIds, setStyleIds] = React.useState(folderStyleIds);
    const [edited, setEdited] = React.useState(false);
    const nameInputRef = React.useRef();

    const close = () => {
        context.dispatch({type: 'setModal'});
    };

    const changeFolderName = e => {
        setName(e.target.value);
        setEdited(true);
    };

    const changeFolderStyles = (id, add) => {
        let folderStyles = styleIds.concat([]);
        if (add) {
            folderStyles.push(id);
        } else {
            folderStyles = folderStyles.filter(sid => (sid !== id));
        }
        setStyleIds(folderStyles);
        setEdited(true);
    };

    const saveFolder = e => {
        e.preventDefault();
        if (!name) {
            nativeAlert(locale.errorFolderCreation, locale.errorTitle, true);
            return false;
        }
        const data = {name, styleIds};
        if (currentData.create) {
            data.id = Math.random().toString(36).substr(2, 8);
        } else {
            data.id = currentData.id;
        }
        context.dispatch({type: 'saveFolder', data});
        close();
    };

    const deleteFolder = e => {
        e.preventDefault();
        if (!currentData.id) return;
        nativeConfirm(locale.confirmDeleteFolder, locale.confirmTitle, ok => {
            if (!ok) return;
            context.dispatch({type: 'deleteFolder', id: currentData.id});
            close();
        });
    };

    React.useEffect(() => {
        if (nameInputRef.current) nameInputRef.current.focus();
    }, []);

    const unsortedStyles = context.state.styles.filter(s => !s.folder);

    return (
        <React.Fragment>
            <div className="app-modal-header hostBrdBotContrast">
                <div className="app-modal-title">
                    {currentData.create ? locale.createFolderTitle : locale.editFolderTitle}
                </div>
                <button className="topcoat-icon-button--large--quiet" title={locale.close} onClick={close}>
                    <FiX size={18} />
                </button>
            </div>
            <div className="app-modal-body">
                <form className="app-modal-body-inner" onSubmit={saveFolder}>
                    <div className="fields">
                        <div className="field">
                            <div className="field-label">
                                {locale.editFolderNameLabel}
                            </div>
                            <div className="field-input">
                                <input 
                                    type="text" 
                                    ref={nameInputRef} 
                                    value={name} 
                                    onChange={changeFolderName} 
                                    className="topcoat-text-input--large"
                                />
                            </div>
                        </div>
                        <div className="field hostBrdTopContrast">
                            <div className="field-label">
                                {locale.editFolderStyles}
                            </div>
                            <div className="field-input">
                                <div className="folder-styles-list hostBrdContrast">
                                    {context.state.styles.length ? (
                                        <React.Fragment>
                                            {(unsortedStyles.length > 0) && (
                                                <FolderStylesList 
                                                    name={locale.noFolderTitle}
                                                    styles={unsortedStyles}
                                                    toggleStyle={changeFolderStyles}
                                                    selected={styleIds}
                                                />
                                            )}
                                            {context.state.folders.map(folder => (
                                                <FolderStylesList 
                                                    key={folder.id} 
                                                    name={folder.name}
                                                    styles={context.state.styles.filter(s => (s.folder === folder.id))}
                                                    toggleStyle={changeFolderStyles}
                                                    selected={styleIds}
                                                />
                                            ))}
                                        </React.Fragment>
                                    ) : (
                                        <div className="folder-styles-list-empty">
                                            {locale.editFolderNoStyles}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="fields folder-edit-actions hostBrdTopContrast">
                        <button type="submit" className={'folder-edit-save ' + (edited ? 'topcoat-button--large--cta' : 'topcoat-button--large')}>
                            <MdSave size={18} /> {locale.save}
                        </button>
                        {currentData.create ? (
                            <button type="button" className="topcoat-button--large--quiet" onClick={close}>
                                <MdCancel size={18} /> {locale.cancel}
                            </button>
                        ) : (
                            <button type="button" className="topcoat-button--large--quiet" onClick={deleteFolder}>
                                <MdDelete size={18} /> {locale.delete}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </React.Fragment>
    );
});


const FolderStylesList = React.memo(function FolderStylesList(props) {
    return (
        <React.Fragment>
            {props.styles.map(style => (
                <label key={style.id} className={'folder-style-item topcoat-checkbox hostBgdLight' + (props.selected.includes(style.id) ? ' m-selected' : '')}>
                    <div className="folder-style-cbx">
                        <input 
                            type="checkbox" 
                            checked={props.selected.includes(style.id)}
                            onChange={e => props.toggleStyle(style.id, e.target.checked)}
                        />
                        <div className="topcoat-checkbox__checkmark"></div>
                    </div>
                    <div className="folder-style-title">
                        {style.name} 
                        <span>({props.name})</span>
                    </div>
                </label>
            ))}
        </React.Fragment>
    );
});
FolderStylesList.propTypes = {
    name: PropTypes.string.isRequired,
    styles: PropTypes.array.isRequired,
    toggleStyle: PropTypes.func.isRequired,
    selected: PropTypes.array.isRequired
};

export default EditFolderModal;