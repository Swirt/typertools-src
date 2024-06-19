#!/bin/sh

set -e

# Detect system language
LANGUAGE=$(defaults read -g AppleLocale | cut -d"_" -f1)

# Messages in English
MSG_INSTALL_EN="Photoshop extension TypeR v1.0.0 will be installed."
MSG_CLOSE_PHOTOSHOP_EN="Close Photoshop (if it is open)."
MSG_PRESS_KEY_EN="Press any key to continue"
MSG_INSTALL_COMPLETE_EN="Installation completed."
MSG_OPEN_PHOTOSHOP_EN="Open Photoshop and in the menu click the following: [Window] > [Extensions] > [TypeR]"
MSG_PRESS_ENTER_EN="Press Enter to continue"
MSG_CREDITS_EN="Thanks a lot to Swirt for TyperTools and SeanR for this fork."
MSG_DISCORD_EN="ScanR's Discord if you need help: https://discord.com/invite/Pdmfmqk"

# Messages in French
MSG_INSTALL_FR="L'extension Photoshop TypeR v1.0.0 sera installée."
MSG_CLOSE_PHOTOSHOP_FR="Fermez Photoshop (s'il est ouvert)."
MSG_PRESS_KEY_FR="Appuyez sur une touche pour continuer"
MSG_INSTALL_COMPLETE_FR="Installation terminée."
MSG_OPEN_PHOTOSHOP_FR="Ouvrez Photoshop et dans le menu cliquez sur : [Fenêtre] > [Extensions] > [TypeR]"
MSG_PRESS_ENTER_FR="Appuyez sur Entrée pour continuer"
MSG_CREDITS_FR="Merci beaucoup à Swirt pour TyperTools et SeanR pour ce fork."
MSG_DISCORD_FR="Discord de ScanR si besoin d'aide : https://discord.com/invite/Pdmfmqk"

# Messages in Spanish
MSG_INSTALL_ES="La extensión de Photoshop TypeR v1.0.0 será instalada."
MSG_CLOSE_PHOTOSHOP_ES="Cierra Photoshop (si está abierto)."
MSG_PRESS_KEY_ES="Presiona cualquier tecla para continuar"
MSG_INSTALL_COMPLETE_ES="Instalación completada."
MSG_OPEN_PHOTOSHOP_ES="Abre Photoshop y en el menú haz clic en: [Ventana] > [Extensiones] > [TypeR]"
MSG_PRESS_ENTER_ES="Presiona Enter para continuar"
MSG_CREDITS_ES="Muchas gracias a Swirt por TyperTools y a SeanR por este fork."
MSG_DISCORD_ES="Discord de ScanR si necesitas ayuda: https://discord.com/invite/Pdmfmqk"

# Messages in Portuguese
MSG_INSTALL_PT="A extensão Photoshop TypeR v1.0.0 será instalada."
MSG_CLOSE_PHOTOSHOP_PT="Feche o Photoshop (se estiver aberto)."
MSG_PRESS_KEY_PT="Pressione qualquer tecla para continuar"
MSG_INSTALL_COMPLETE_PT="Instalação concluída."
MSG_OPEN_PHOTOSHOP_PT="Abra o Photoshop e no menu clique em: [Janela] > [Extensões] > [TypeR]"
MSG_PRESS_ENTER_PT="Pressione Enter para continuar"
MSG_CREDITS_PT="Muito obrigado ao Swirt pelo TyperTools e ao SeanR por este fork."
MSG_DISCORD_PT="Discord do ScanR se precisar de ajuda: https://discord.com/invite/Pdmfmqk"

# Set messages based on system language
if [ "$LANGUAGE" = "fr" ]; then
  MSG_INSTALL=$MSG_INSTALL_FR
  MSG_CLOSE_PHOTOSHOP=$MSG_CLOSE_PHOTOSHOP_FR
  MSG_PRESS_KEY=$MSG_PRESS_KEY_FR
  MSG_INSTALL_COMPLETE=$MSG_INSTALL_COMPLETE_FR
  MSG_OPEN_PHOTOSHOP=$MSG_OPEN_PHOTOSHOP_FR
  MSG_PRESS_ENTER=$MSG_PRESS_ENTER_FR
  MSG_CREDITS=$MSG_CREDITS_FR
  MSG_DISCORD=$MSG_DISCORD_FR
elif [ "$LANGUAGE" = "es" ]; then
  MSG_INSTALL=$MSG_INSTALL_ES
  MSG_CLOSE_PHOTOSHOP=$MSG_CLOSE_PHOTOSHOP_ES
  MSG_PRESS_KEY=$MSG_PRESS_KEY_ES
  MSG_INSTALL_COMPLETE=$MSG_INSTALL_COMPLETE_ES
  MSG_OPEN_PHOTOSHOP=$MSG_OPEN_PHOTOSHOP_ES
  MSG_PRESS_ENTER=$MSG_PRESS_ENTER_ES
  MSG_CREDITS=$MSG_CREDITS_ES
  MSG_DISCORD=$MSG_DISCORD_ES
elif [ "$LANGUAGE" = "pt" ]; then
  MSG_INSTALL=$MSG_INSTALL_PT
  MSG_CLOSE_PHOTOSHOP=$MSG_CLOSE_PHOTOSHOP_PT
  MSG_PRESS_KEY=$MSG_PRESS_KEY_PT
  MSG_INSTALL_COMPLETE=$MSG_INSTALL_COMPLETE_PT
  MSG_OPEN_PHOTOSHOP=$MSG_OPEN_PHOTOSHOP_PT
  MSG_PRESS_ENTER=$MSG_PRESS_ENTER_PT
  MSG_CREDITS=$MSG_CREDITS_PT
  MSG_DISCORD=$MSG_DISCORD_PT
else
  MSG_INSTALL=$MSG_INSTALL_EN
  MSG_CLOSE_PHOTOSHOP=$MSG_CLOSE_PHOTOSHOP_EN
  MSG_PRESS_KEY=$MSG_PRESS_KEY_EN
  MSG_INSTALL_COMPLETE=$MSG_INSTALL_COMPLETE_EN
  MSG_OPEN_PHOTOSHOP=$MSG_OPEN_PHOTOSHOP_EN
  MSG_PRESS_ENTER=$MSG_PRESS_ENTER_EN
  MSG_CREDITS=$MSG_CREDITS_EN
  MSG_DISCORD=$MSG_DISCORD_EN
fi

cat << EOF
$MSG_INSTALL

$MSG_CLOSE_PHOTOSHOP

EOF
read -n 1 -p "$MSG_PRESS_KEY"
echo

SRCDIR=$(cd "$(dirname "$0")" && pwd)

is_preferences_domain_exists() {
  defaults read "$1" > /dev/null 2> /dev/null
}

for version in {6..12}; do
  if is_preferences_domain_exists com.adobe.CSXS.${version} ; then
    defaults write com.adobe.CSXS.${version} PlayerDebugMode 1
  fi
done
killall -u `whoami` csprefsd > /dev/null 2> /dev/null || true

DESTDIR="${HOME}/Library/Application Support/Adobe/CEP/extensions/typertools"

if [ -e "${DESTDIR}/storage" ]; then
  cp "${DESTDIR}/storage" "${SRCDIR}/__storage"
fi

if [ -e "${DESTDIR}" ]; then
  rm -rf "${DESTDIR}"
fi

mkdir -p "${DESTDIR}"
for item in app CSXS icons locale .debug; do
  if [ -e "${SRCDIR}/${item}" ]; then
    cp -rf "${SRCDIR}/${item}" "${DESTDIR}/${item}"
  fi
done

if [ -e "${SRCDIR}/__storage" ]; then
  cp -f "${SRCDIR}/__storage" "${DESTDIR}/storage"
  rm -f "${SRCDIR}/__storage"
fi

cat << EOF

$MSG_INSTALL_COMPLETE
$MSG_OPEN_PHOTOSHOP

$MSG_CREDITS
$MSG_DISCORD

EOF
read -n 1 -p "$MSG_PRESS_ENTER"
echo
