import React from "react";
import PropTypes from "prop-types";
import { locale, readStorage, writeToStorage, scrollToLine, scrollToStyle } from "./utils";

const storage = readStorage();
const storeFields = ["notFirstTime", "text", "styles", "folders", "textScale", "currentLineIndex", "currentStyleId", "pastePointText", "ignoreLinePrefixes", "defaultStyleId"];

const initialState = {
  notFirstTime: false,
  initiated: false,
  text: "",
  lines: [],
  styles: [],
  folders: [],
  openFolders: [],
  textScale: null,
  currentLine: null,
  currentLineIndex: 0,
  currentStyle: null,
  currentStyleId: null,
  pastePointText: false,
  ignoreLinePrefixes: ["##"],
  defaultStyleId: null,
  modalType: null,
  modalData: {},
  ...storage.data,
};

const reducer = (state, action) => {
  console.log("CONTEXT:", action);

  let thenScroll = false;
  let thenSelectStyle = false;
  const newState = Object.assign({}, state);
  switch (action.type) {
    case "removeFirstTime": {
      newState.notFirstTime = true;
      newState.modalType = "help";
      break;
    }

    case "import": {
      for (const field in action.data) {
        if (!action.data.hasOwnProperty(field)) continue;
        if (!initialState.hasOwnProperty(field)) continue;
        if (field === "styles" && state.styles) {
          const styles = [];
          let asked = false;
          let keep = false;
          for (const style of state.styles) {
            const inImport = action.data.styles.find((s) => s.id === style.id);
            if (!inImport || (style.edited && !inImport.edited) || (style.edited && inImport.edited && style.edited > inImport.edited)) {
              if (!asked) {
                keep = confirm(locale.settingsImportReplace);
                asked = true;
              }
              if (keep) styles.push(style);
            }
          }
          for (const style of action.data.styles) {
            if (!keep) {
              styles.push(style);
            } else {
              const oldStyle = state.styles.find((s) => s.id === style.id);
              if (!oldStyle?.edited || (style.edited && style.edited >= oldStyle.edited)) {
                styles.push(style);
              }
            }
          }
          newState[field] = styles;
        } else {
          newState[field] = action.data[field];
        }
      }
      break;
    }

    case "setText": {
      newState.text = action.text;
      break;
    }

    case "setCurrentLineIndex": {
      newState.currentLineIndex = action.index;
      thenSelectStyle = true;
      break;
    }

    case "prevLine": {
      if (!state.text) break;
      let newIndex = state.currentLineIndex;
      for (let i = newIndex - 1; i >= 0; i--) {
        if (!state.lines[i].ignore) {
          newState.currentLineIndex = state.lines[i].rawIndex;
          break;
        }
      }
      thenScroll = true;
      thenSelectStyle = true;
      break;
    }

    case "nextLine": {
      if (!state.text) break;
      let newIndex = state.currentLineIndex;
      for (let i = newIndex + 1; i < state.lines.length; i++) {
        if (!state.lines[i].ignore) {
          newState.currentLineIndex = state.lines[i].rawIndex;
          break;
        }
      }
      thenScroll = true;
      thenSelectStyle = true;
      break;
    }

    case "setCurrentStyleId": {
      newState.currentStyleId = action.id;
      break;
    }

    case "setTextScale": {
      let scale = parseInt(action.scale) || null;
      if (scale) {
        if (scale < 1) scale = 1;
        if (scale > 999) scale = 999;
      }
      newState.textScale = scale;
      break;
    }

    case "saveFolder": {
      const editId = action.id || action.data.id;
      if (action.data.styleIds) {
        let styles = state.styles.concat([]);
        styles
          .filter((s) => s.folder === editId)
          .forEach((style) => {
            if (!action.data.styleIds.includes(style.id)) style.folder = null;
          });
        action.data.styleIds.forEach((sid) => {
          const style = styles.find((s) => s.id === sid);
          if (style) style.folder = editId;
        });
        newState.styles = styles;
        delete action.data.styleIds;
      }
      const folders = state.folders.concat([]);
      const folder = folders.find((f) => f.id === editId);
      if (folder) Object.assign(folder, action.data);
      else folders.push(action.data);
      newState.folders = folders;
      break;
    }

    case "deleteFolder": {
      newState.folders = state.folders.filter((f) => f.id !== action.id);
      break;
    }

    case "toggleFolder": {
      let open = state.openFolders.concat([]);
      const id = action.id || "unsorted";
      if (open.includes(id)) open = open.filter((f) => f !== id);
      else open.push(id);
      newState.openFolders = open;
      break;
    }

    case "setFolders": {
      newState.folders = action.data || [];
      break;
    }

    case "saveStyle": {
      if (typeof action.data.prefixes === "string") {
        const arr = action.data.prefixes.split(/\s+/);
        action.data.prefixes = arr.filter(Boolean);
      } else if (!Array.isArray(action.data.prefixes)) {
        action.data.prefixes = [];
      }
      const styles = state.styles.concat([]);
      const editId = action.id || action.data.id;
      const style = styles.find((s) => s.id === editId);
      if (style) Object.assign(style, action.data);
      else styles.push(action.data);
      newState.styles = styles;
      break;
    }

    case "deleteStyle": {
      newState.styles = state.styles.filter((s) => s.id !== action.id);
      break;
    }

    case "setStyles": {
      newState.styles = action.data || [];
      break;
    }

    case "setIgnoreLinePrefixes": {
      if (!action.data) {
        newState.ignoreLinePrefixes = [];
      } else if (Array.isArray(action.data)) {
        newState.ignoreLinePrefixes = action.data;
      } else if (typeof action.data === "string") {
        const arr = action.data.split(/\s+/);
        newState.ignoreLinePrefixes = arr.filter(Boolean);
      }
      break;
    }

    case "setDefaultStyleId": {
      newState.defaultStyleId = action.id || null;
      break;
    }

    case "setPastePointText": {
      newState.pastePointText = !!action.isPoint;
      break;
    }

    case "setModal": {
      newState.modalType = action.modal || null;
      newState.modalData = action.data || {};
      break;
    }
  }

  for (const style of newState.styles) {
    const folderId = style.folder || null;
    const hasFolder = newState.folders.find((f) => f.id === folderId);
    if (!hasFolder) style.folder = null;
  }

  if (newState.defaultStyleId) {
    const hasDefault = newState.styles.find((s) => s.id === newState.defaultStyleId);
    if (!hasDefault) newState.defaultStyleId = null;
  }

  let sortedStyles = newState.styles.filter((s) => !s.folder);
  for (const folder of newState.folders) {
    const folderStyles = newState.styles.filter((s) => s.folder === folder.id);
    sortedStyles = sortedStyles.concat(folderStyles);
  }
  newState.styles = sortedStyles;

  const stylePrefixes = [];
  for (const style of newState.styles) {
    const folder = style.folder || null;
    for (const prefix of style.prefixes) {
      stylePrefixes.push({ prefix, style, folder });
    }
  }

  let linesCounter = 0;
  const rawLines = newState.text ? newState.text.split("\n") : [];
  newState.lines = rawLines.map((rawText, rawIndex) => {
    const ignorePrefix = newState.ignoreLinePrefixes.find((pr) => rawText.startsWith(pr)) || "";
    const hasStylePrefix = stylePrefixes.find((sp) => rawText.startsWith(sp.prefix));
    const stylePrefix = hasStylePrefix ? hasStylePrefix.prefix : "";
    const style = hasStylePrefix ? hasStylePrefix.style : null;
    const text = rawText.replace(ignorePrefix, "").replace(stylePrefix, "").trim();
    const ignore = !!ignorePrefix || !text || rawText.match(/Page [0-9]+/);
    const index = ignore ? 0 : ++linesCounter;
    return { rawText, rawIndex, ignorePrefix, stylePrefix, style, ignore, index, text };
  });

  newState.currentLine = newState.lines[newState.currentLineIndex] || null;
  if (!newState.currentLine || newState.currentLine.ignore) {
    let newIndex = 0;
    for (let line of newState.lines) {
      if (!line.ignore) {
        newIndex = line.rawIndex;
        break;
      }
    }
    newState.currentLine = newState.lines[newIndex] || null;
    newState.currentLineIndex = newIndex;
  }
  if (thenSelectStyle) {
    if (newState.currentLine.style) {
      newState.currentStyleId = newState.currentLine.style.id;
    } else if (newState.defaultStyleId) {
      newState.currentStyleId = newState.defaultStyleId;
    }
  }

  newState.currentStyle = newState.styles.find((s) => s.id === newState.currentStyleId);
  if (!newState.currentStyle) {
    const newId = newState.styles.length ? newState.styles[0].id : null;
    newState.currentStyle = newId ? newState.styles[0] : null;
    newState.currentStyleId = newId;
  }

  if (!newState.initiated) {
    if (newState.currentStyle?.folder) {
      newState.openFolders = [newState.currentStyle.folder];
    } else {
      newState.openFolders = ["unsorted"];
    }
  }
  if (newState.currentStyle && newState.currentStyleId !== state.currentStyleId) {
    const folder = newState.currentStyle.folder || "unsorted";
    if (!newState.openFolders.includes(folder)) newState.openFolders.push(folder);
    scrollToStyle(newState.currentStyleId);
  }
  if (thenScroll) {
    scrollToLine(newState.currentLineIndex);
  }

  const dataToStore = {};
  for (let field in newState) {
    if (!newState.hasOwnProperty(field)) continue;
    if (storeFields.includes(field)) {
      dataToStore[field] = newState[field];
    }
  }
  newState.initiated = true;
  writeToStorage(dataToStore);

  return newState;
};

const Context = React.createContext();
const useContext = () => React.useContext(Context);
const ContextProvider = React.memo(function ContextProvider(props) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  React.useEffect(() => dispatch({}), []);
  return <Context.Provider value={{ state, dispatch }}>{props.children}</Context.Provider>;
});
ContextProvider.propTypes = {
  children: PropTypes.any.isRequired,
};

export { useContext, ContextProvider };
