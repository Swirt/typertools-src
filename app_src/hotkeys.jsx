import _ from "lodash";
import React from "react";

import { csInterface, setActiveLayerText, createTextLayerInSelection, alignTextLayerToSelection, getHotkeyPressed } from "./utils";
import { useContext } from "./context";

const CTRL = "CTRL";
const SHIFT = "SHIFT";
const ALT = "ALT";
const WIN = "WIN";

const repeatTime = 2000;
const intervalTime = 50;
let keyboardInterval = 0;
let canRepeat = true;
let keyUp = true;

const checkRepeatTime = () => {
  if (canRepeat && keyUp) {
    setTimeout(() => {
      canRepeat = true;
    }, repeatTime);
    canRepeat = false;
    keyUp = false;
    return true;
  } else {
    return false;
  }
};

const checkShortcut = (state, ref) => {
  return ref.every((key) => state.includes(key));
};

const HotkeysListner = React.memo(function HotkeysListner() {
  const context = useContext();
  const checkState = (state) => {
    const realState = state.split("a");
    realState.shift();
    realState.pop();
    if (checkShortcut(realState, context.state.shortcut.add)) {
      if (!checkRepeatTime()) return;
      const line = context.state.currentLine || { text: "" };
      let style = context.state.currentStyle;
      if (style && context.state.textScale) {
        style = _.cloneDeep(style);
        style.textProps.layerText.textStyleRange[0].textStyle.size *= context.state.textScale / 100;
        if (style.textProps.layerText.textStyleRange[0].textStyle.leading) {
          style.textProps.layerText.textStyleRange[0].textStyle.leading *= context.state.textScale / 100;
        }
      }
      const pointText = context.state.pastePointText;
      createTextLayerInSelection(line.text, style, pointText, (ok) => {
        if (ok) context.dispatch({ type: "nextLine" });
      });
    } else if (checkShortcut(realState, context.state.shortcut.next)) {
      if (!checkRepeatTime()) return;
      const line = context.state.currentLine || { text: "" };
      let style = context.state.currentStyle;
      if (style && context.state.textScale) {
        style = _.cloneDeep(style);
        style.textProps.layerText.textStyleRange[0].textStyle.size *= context.state.textScale / 100;
        if (style.textProps.layerText.textStyleRange[0].textStyle.leading) {
          style.textProps.layerText.textStyleRange[0].textStyle.leading *= context.state.textScale / 100;
        }
      }
      setActiveLayerText(line.text, style, (ok) => {
        if (ok) context.dispatch({ type: "nextLine" });
      });
    } else if (checkShortcut(realState, context.state.shortcut.center)) {
      if (!checkRepeatTime()) return;
      alignTextLayerToSelection();
    } else {
      keyUp = true;
    }
  };

  clearInterval(keyboardInterval);
  keyboardInterval = setInterval(() => {
    if (context.state.modalType === "settings") return;
    getHotkeyPressed(checkState);
  }, intervalTime);

  document.onkeydown = (e) => {
    if (e.key === "Escape") {
      if (context.state.modalType) {
        context.dispatch({ type: "setModal" });
      }
    }
  };

  React.useEffect(() => {
    const keyInterests = [{ keyCode: 27 }];
    csInterface.registerKeyEventsInterest(JSON.stringify(keyInterests));
  }, []);

  return <React.Fragment />;
});

export default HotkeysListner;
