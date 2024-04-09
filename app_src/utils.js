import "./lib/CSInterface";

const csInterface = new window.CSInterface();
const path = csInterface.getSystemPath(window.SystemPath.EXTENSION);
const storagePath = path + "/storage";

const locale = csInterface.initResourceBundle();

const openUrl = window.cep.util.openURLInDefaultBrowser;

const readStorage = (key) => {
  const result = window.cep.fs.readFile(storagePath);
  if (result.err) {
    return key
      ? void 0
      : {
          error: result.err,
          data: {},
        };
  } else {
    const data = JSON.parse(result.data || "{}") || {};
    return key ? data[key] : { data };
  }
};

const writeToStorage = (data, rewrite) => {
  const storage = readStorage();
  if (storage.error || rewrite) {
    const result = window.cep.fs.writeFile(storagePath, JSON.stringify(data));
    return !result.err;
  } else {
    data = Object.assign({}, storage.data, data);
    const result = window.cep.fs.writeFile(storagePath, JSON.stringify(data));
    return !result.err;
  }
};

const nativeAlert = (text, title, isError) => {
  const data = JSON.stringify({ text, title, isError });
  csInterface.evalScript("nativeAlert(" + data + ")");
};

const nativeConfirm = (text, title, callback) => {
  const data = JSON.stringify({ text, title });
  csInterface.evalScript("nativeConfirm(" + data + ")", (result) => callback(!!result));
};

let userFonts = null;
const getUserFonts = () => {
  return Array.isArray(userFonts) ? userFonts.concat([]) : [];
};
if (!userFonts) {
  csInterface.evalScript("getUserFonts()", (data) => {
    const dataObj = JSON.parse(data || "{}");
    const fonts = dataObj.fonts || [];
    userFonts = fonts;
  });
}

const getActiveLayerText = (callback) => {
  csInterface.evalScript("getActiveLayerText()", (data) => {
    const dataObj = JSON.parse(data || "{}");
    if (!data || !dataObj.textProps) nativeAlert(locale.errorNoTextLayer, locale.errorTitle, true);
    else callback(dataObj);
  });
};

const setActiveLayerText = (text, style, callback = () => {}) => {
  if (!text && !style) {
    nativeAlert(locale.errorNoTextNoStyle, locale.errorTitle, true);
    callback(false);
    return false;
  }
  const data = JSON.stringify({ text, style });
  csInterface.evalScript("setActiveLayerText(" + data + ")", (error) => {
    if (error) nativeAlert(locale.errorNoTextLayer, locale.errorTitle, true);
    callback(!error);
  });
};

const createTextLayerInSelection = (text, style, pointText, callback = () => {}) => {
  if (!text) {
    nativeAlert(locale.errorNoText, locale.errorTitle, true);
    callback(false);
    return false;
  }
  if (!style) {
    style = { textProps: getDefaultStyle() };
  }
  const data = JSON.stringify({ text, style });
  csInterface.evalScript("createTextLayerInSelection(" + data + ", " + !!pointText + ")", (error) => {
    if (error === "smallSelection") nativeAlert(locale.errorSmallSelection, locale.errorTitle, true);
    else if (error) nativeAlert(locale.errorNoSelection, locale.errorTitle, true);
    callback(!error);
  });
};

const alignTextLayerToSelection = () => {
  csInterface.evalScript("alignTextLayerToSelection()", (error) => {
    if (error === "smallSelection") nativeAlert(locale.errorSmallSelection, locale.errorTitle, true);
    else if (error === "noSelection") nativeAlert(locale.errorNoSelection, locale.errorTitle, true);
    else if (error) nativeAlert(locale.errorNoTextLayer, locale.errorTitle, true);
  });
};

const changeActiveLayerTextSize = (val, callback = () => {}) => {
  csInterface.evalScript("changeActiveLayerTextSize(" + val + ")", (error) => {
    if (error) nativeAlert(locale.errorNoTextLayer, locale.errorTitle, true);
    callback(!error);
  });
};

const getHotkeyPressed = (callback) => {
  csInterface.evalScript("getHotkeyPressed()", callback);
};

const resizeTextArea = () => {
  const textArea = document.querySelector(".text-area");
  const textLines = document.querySelector(".text-lines");
  if (textArea && textLines) {
    textArea.style.height = textLines.offsetHeight + "px";
  }
};

const scrollToLine = (lineIndex, delay = 300) => {
  lineIndex = lineIndex < 5 ? 0 : lineIndex - 5;
  setTimeout(() => {
    const line = document.querySelectorAll(".text-line")[lineIndex];
    if (line) line.scrollIntoView();
  }, delay);
};

const scrollToStyle = (styleId, delay = 100) => {
  setTimeout(() => {
    const style = document.getElementById(styleId);
    if (style) style.scrollIntoView();
  }, delay);
};

const rgbToHex = (rgb = {}) => {
  const componentToHex = (c = 0) => ("0" + c.toString(16)).substr(-2).toUpperCase();
  return "#" + componentToHex(rgb.red) + componentToHex(rgb.green) + componentToHex(rgb.blue);
};

const getStyleObject = (textStyle) => {
  const styleObj = {};
  if (textStyle.fontName) styleObj.fontFamily = textStyle.fontName;
  if (textStyle.fontPostScriptName) styleObj.fontFileFamily = textStyle.fontPostScriptName;
  if (textStyle.syntheticBold) styleObj.fontWeight = "bold";
  if (textStyle.syntheticItalic) styleObj.fontStyle = "italic";
  if (textStyle.fontCaps === "allCaps") styleObj.textTransform = "uppercase";
  if (textStyle.fontCaps === "smallCaps") styleObj.textTransform = "lowercase";
  if (textStyle.underline && textStyle.underline !== "underlineOff") styleObj.textDecoration = "underline";
  if (textStyle.strikethrough && textStyle.strikethrough !== "strikethroughOff") {
    if (styleObj.textDecoration) styleObj.textDecoration += " line-through";
    else styleObj.textDecoration = "line-through";
  }
  return styleObj;
};

const getDefaultStyle = () => {
  return {
    layerText: {
      textGridding: "none",
      orientation: "horizontal",
      antiAlias: "antiAliasSmooth",
      textStyleRange: [
        {
          from: 0,
          to: 100,
          textStyle: {
            fontPostScriptName: "Tahoma",
            fontName: "Tahoma",
            fontStyleName: "Regular",
            fontScript: 0,
            fontTechnology: 1,
            fontAvailable: true,
            size: 14,
            impliedFontSize: 14,
            horizontalScale: 100,
            verticalScale: 100,
            autoLeading: true,
            tracking: 0,
            baselineShift: 0,
            impliedBaselineShift: 0,
            autoKern: "metricsKern",
            fontCaps: "normal",
            digitSet: "defaultDigits",
            markYDistFromBaseline: 100,
            otbaseline: "normal",
            ligature: false,
            altligature: false,
            connectionForms: false,
            contextualLigatures: false,
            baselineDirection: "withStream",
            color: { red: 0, green: 0, blue: 0 },
          },
        },
      ],
      paragraphStyleRange: [
        {
          from: 0,
          to: 100,
          paragraphStyle: {
            burasagari: "burasagariNone",
            singleWordJustification: "justifyAll",
            justificationMethodType: "justifMethodAutomatic",
            textEveryLineComposer: false,
            alignment: "center",
            hangingRoman: true,
            hyphenate: true,
          },
        },
      ],
    },
    typeUnit: "pixelsUnit",
  };
};

const openFile = (path) => {
  csInterface.evalScript("openFile('" + path + "')");
};

export { csInterface, locale, openUrl, readStorage, writeToStorage, nativeAlert, nativeConfirm, getUserFonts, getActiveLayerText, setActiveLayerText, createTextLayerInSelection, alignTextLayerToSelection, changeActiveLayerTextSize, getHotkeyPressed, resizeTextArea, scrollToLine, scrollToStyle, rgbToHex, getStyleObject, getDefaultStyle, openFile };
