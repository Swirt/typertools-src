import './footer.scss';

import React from 'react';
import {locale} from '../../utils';
import {useContext} from '../../context';


const AppFooter = React.memo(function AppFooter() {
    const context = useContext();
    const openSettings = () => {
        context.dispatch({
            type: 'setModal', 
            modal: 'settings'
        });
    };
    const openHelp = () => {
        context.dispatch({
            type: 'setModal', 
            modal: 'help'
        });
    };
    return (
        <React.Fragment>
            <span className="link" onClick={openHelp}>{locale.footerHelp}</span>
            <span className="link" onClick={openSettings}>{locale.footerSettings}</span>
        </React.Fragment>
    );
});

export default AppFooter;