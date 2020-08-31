import './CSInterface';

import LightTheme from './topcoat/css/topcoat-desktop-light.min.css';
import DarkTheme from './topcoat/css/topcoat-desktop-dark.min.css';


function computeValue(value, delta) {
    var computedValue = !isNaN(delta) ? value + delta : value;
    if (computedValue < 0) {
        computedValue = 0;
    } else if (computedValue > 255) {
        computedValue = 255;
    }
    computedValue = Math.floor(computedValue);
    computedValue = computedValue.toString(16);
    return computedValue.length === 1 ? "0" + computedValue : computedValue;
}

function toHex(color, delta) {
    var hex = "";
    if (color) {
        hex = computeValue(color.red, delta) + computeValue(color.green, delta) + computeValue(color.blue, delta);
    }
    return hex;
}

function addRule(stylesheetId, selector, rule) {
    var stylesheet = document.getElementById(stylesheetId);
    if (stylesheet) {
        stylesheet = stylesheet.sheet;
        if (stylesheet.addRule) {
            stylesheet.addRule(selector, rule);
        } else if (stylesheet.insertRule) {
            stylesheet.insertRule(selector + ' { ' + rule + ' }', stylesheet.cssRules.length);
        }
    }
}

function updateThemeWithAppSkinInfo(appSkinInfo) {
    
    var panelBgColor = appSkinInfo.panelBackgroundColor.color;
    var lightBgdColor = toHex(panelBgColor, 20);
    var darkBgdColor = toHex(panelBgColor, -20);
    var bgdColor = toHex(panelBgColor);
    var isLight = panelBgColor.red >= 125;
    var fontColor = isLight ? "000000" : "F0F0F0";
    var styleId = "hostStyle";
    
    addRule(styleId, ".hostElt", "background-color: #" + bgdColor);
    addRule(styleId, ".hostElt", "font-size: " + appSkinInfo.baseFontSize + "px;");
    addRule(styleId, ".hostElt", "font-family: " + appSkinInfo.baseFontFamily);
    addRule(styleId, ".hostElt", "color: #" + fontColor);
    
    addRule(styleId, ".hostBgd", "background-color: #" + bgdColor);
    addRule(styleId, ".hostBgdDark", "background-color: #" + darkBgdColor);
    addRule(styleId, ".hostBgdLight", "background-color: #" + lightBgdColor);

    addRule(styleId, ".hostBrd", "border: 1px solid #" + bgdColor);
    addRule(styleId, ".hostBrdDark", "border: 1px solid #" + darkBgdColor);
    addRule(styleId, ".hostBrdLight", "border: 1px solid #" + lightBgdColor);
    addRule(styleId, ".hostBrdContrast", "border: 1px solid rgba(" + (isLight ? "0, 0, 0" : "255, 255, 255") + ", 0.2)");
    addRule(styleId, ".hostBrdTop", "border-top: 1px solid #" + bgdColor);
    addRule(styleId, ".hostBrdTopDark", "border-top: 1px solid #" + darkBgdColor);
    addRule(styleId, ".hostBrdTopLight", "border-top: 1px solid #" + lightBgdColor);
    addRule(styleId, ".hostBrdTopContrast", "border-top: 1px solid rgba(" + (isLight ? "0, 0, 0" : "255, 255, 255") + ", 0.2)");
    addRule(styleId, ".hostBrdBot", "border-bottom: 1px solid #" + bgdColor);
    addRule(styleId, ".hostBrdBotDark", "border-bottom: 1px solid #" + darkBgdColor);
    addRule(styleId, ".hostBrdBotLight", "border-bottom: 1px solid #" + lightBgdColor);
    addRule(styleId, ".hostBrdBotContrast", "border-bottom: 1px solid rgba(" + (isLight ? "0, 0, 0" : "255, 255, 255") + ", 0.2)");

    addRule(styleId, ".hostFontSize", "font-size: " + appSkinInfo.baseFontSize + "px;");
    addRule(styleId, ".hostFontFamily", "font-family: " + appSkinInfo.baseFontFamily);
    addRule(styleId, ".hostFontColor", "color: #" + fontColor);
    addRule(styleId, ".hostFont", "font-size: " + appSkinInfo.baseFontSize + "px;");
    addRule(styleId, ".hostFont", "font-family: " + appSkinInfo.baseFontFamily);
    addRule(styleId, ".hostFont", "color: #" + fontColor);
    
    addRule(styleId, ".hostButton", "background-color: #" + darkBgdColor);
    addRule(styleId, ".hostButton:hover", "background-color: #" + bgdColor);
    addRule(styleId, ".hostButton:active", "background-color: #" + darkBgdColor);
    addRule(styleId, ".hostButton", "border-color: #" + lightBgdColor);
    
    var topcoatCSS = document.getElementById('topcoat');
    topcoatCSS.href = isLight ? LightTheme : DarkTheme;
    if (isLight) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }
}

function onAppThemeColorChanged() {
    var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
    updateThemeWithAppSkinInfo(skinInfo);
}

const csInterface = new window.CSInterface();
updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);
csInterface.addEventListener(window.CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);