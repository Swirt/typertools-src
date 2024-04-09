import "./footer.scss";

import React from "react";
import { locale, openFile as utilsOpenFile } from "../../utils";
import { useContext } from "../../context";
import { fromEvent } from "file-selector";

const AppFooter = React.memo(function AppFooter() {
  const context = useContext();
  const openSettings = () => {
    context.dispatch({
      type: "setModal",
      modal: "settings",
    });
  };
  const openHelp = () => {
    context.dispatch({
      type: "setModal",
      modal: "help",
    });
  };
  const openRepository = (e) => {
    const directory = window.showDirectoryPicker().then((e) => alert(e));
  };
  return (
    <React.Fragment>
      <span className="link" onClick={openHelp}>
        {locale.footerHelp}
      </span>
      <span className="link" onClick={openSettings}>
        {locale.footerSettings}
      </span>
      <span className="link" onClick={openRepository}>
        {locale.footerOpenRepo}
      </span>
    </React.Fragment>
  );
});

export default AppFooter;
