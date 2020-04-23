@echo off
chcp 1251 >nul
setlocal EnableDelayedExpansion

echo Установка расширения для Фотошопа Typer Tools v0.6.0
echo.
echo Закройте Фотошоп, если он открыт.
echo.
PAUSE

for /l %%x in (4, 1, 12) do (
    reg query HKEY_CURRENT_USER\SOFTWARE\Adobe\CSXS.%%x 2>nul 
    if !errorlevel! equ 0 (
        reg add HKEY_CURRENT_USER\SOFTWARE\Adobe\CSXS.%%x /t REG_SZ /v PlayerDebugMode /d 1 /f
    )
)

set Directory=%HOMEDRIVE%%HOMEPATH%\AppData\Roaming\Adobe\CEP\extensions\typertools
if exist "%Directory%\app\storage" copy "%Directory%\app\storage" __storage /Y
if exist "%Directory%" rmdir "%Directory%" /S/Q
if not exist "%Directory%\*" md "%Directory%"

xcopy app "%Directory%\app\" /E/Y
xcopy host "%Directory%\host\" /E/Y
xcopy CSXS "%Directory%\CSXS\" /E/Y
xcopy icons "%Directory%\icons\" /E/Y
if exist .debug copy .debug "%Directory%\.debug" /Y
if exist __storage (
    copy __storage "%Directory%\app\storage" /Y
    del __storage /F
)

echo. & echo.
echo Установка завершена
echo Запустите Фотошоп и выберите в меню [Окно] ^> [Расширения] ^> [Typer Tools]
echo.

PAUSE