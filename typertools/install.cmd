::@echo off
echo Установка расширения для Фотошопа Typer Tools v0.6.0
echo.
echo Закройте Фотошоп, если он открыт.
echo.
PAUSE

setlocal EnableDelayedExpansion
for /l %%x in (6, 1, 12) do (
    reg query HKEY_CURRENT_USER\SOFTWARE\Adobe\CSXS.%%x 2>nul 
    if !errorlevel! equ 0 (
        reg add HKEY_CURRENT_USER\SOFTWARE\Adobe\CSXS.%%x /t REG_SZ /v PlayerDebugMode /d 1 /f
    )
)

set Directory=%HOMEDRIVE%%HOMEPATH%\AppData\Roaming\Adobe\CEP\extensions\typertools
if exist "%Directory%\app\storage" set /p oldStorage=<"%Directory%\app\storage"
if exist "%Directory%" rmdir "%Directory%" /S/Q
if not exist "%Directory%\*" md "%Directory%"

xcopy app "%Directory%\app\" /E/Y/C
xcopy host "%Directory%\host\" /E/Y/C
xcopy CSXS "%Directory%\CSXS\" /E/Y/C
xcopy icons "%Directory%\icons\" /E/Y/C
xcopy locale "%Directory%\locale\" /E/Y/C
if exist .debug copy .debug "%Directory%\.debug" /Y
if defined oldStorage echo %oldStorage%>"%Directory%\app\storage"
echo %oldStorage%

echo. & echo.
echo Установка завершена
echo Запустите Фотошоп и выберите в меню [Окно] ^> [Расширения] ^> [Typer Tools]
echo.

PAUSE