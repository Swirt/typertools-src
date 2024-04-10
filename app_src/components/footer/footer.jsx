import "./footer.scss";

import React from "react";
import { locale, openFile, openFile as utilsOpenFile } from "../../utils";
import { useContext } from "../../context";

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
    const extension = ["psd", "png", "jpg", "jpeg"];
    const result = window.cep.fs.showOpenDialogEx(true, false, "Open Images", "", extension);
    if (result.err == 0) {
      const images = result.data
        .map((url) => {
          const name = url.split(/\/|\\/).pop();
          const extName = name.split(/\./).pop();
          const baseName = name.substring(0, name.length - extName.length - 1);
          return { name: name, baseName: baseName, path: url };
        })
        .sort((a, b) => a.baseName - b.baseName);
      context.dispatch({
        type: "setImages",
        images: images,
      });
    } else {
      console.log(result.err);
    }
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
