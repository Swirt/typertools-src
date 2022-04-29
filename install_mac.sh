#!/bin/sh

set -e
cat << EOF
Photoshop extension Typer Tools v1.4.5 will be installed.

Close Photoshop (if it is open).

EOF
read -n 1 -p "Press any key to continue"
echo

SRCDIR=$(cd "$(dirname "$0")" && pwd)

is_preferences_domain_exists() {
  defaults read "$1" > /dev/null 2> /dev/null
}

for version in {4..10}; do
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

Installation completed.
Open Photoshop and in the menu click the following: [Window] > [Extensions] > [Typer Tools]

EOF
read -n 1 -p "Press Enter to continue"
echo
