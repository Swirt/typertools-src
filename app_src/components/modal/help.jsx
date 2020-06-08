import React from 'react';
import {FiX} from "react-icons/fi";

import config from '../../config';
import {locale, openUrl} from '../../utils';
import {useContext} from '../../context';


const HelpModal = React.memo(function HelpModal() {
    const context = useContext();
    const close = () => {
        context.dispatch({type: 'setModal'});
    };
    return (
        <React.Fragment>
            <div className="app-modal-header hostBrdBotContrast">
                <div className="app-modal-title">
                    {locale.helpTitle}
                </div>
                <button className="topcoat-icon-button--large--quiet" title={locale.close} onClick={close}>
                    <FiX size={18} />
                </button>
            </div>
            <div className="app-modal-body">
                <div className="app-modal-body-inner article-format" 
                    dangerouslySetInnerHTML = {
                        { __html: locale.helpText} 
                    }
                ></div>
            </div>
            <div className="app-modal-footer hostBrdTopContrast">
                <span className="link" onClick={() => openUrl(config.appUrl)}><b>{config.appTitle}</b></span> ({locale.helpVersion}: {config.appVersion})
                , {locale.helpAuthor} <span className="link" onClick={() => openUrl(config.authorUrl)}>{config.authorName}</span>
            </div>
        </React.Fragment>
    );
});

export default HelpModal;