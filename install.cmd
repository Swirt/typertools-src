@echo off
echo Photoshop extension Typer Tools v1.0.0 will be installed.
echo.
echo Close Photoshop (if it is open).
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
if exist "%Directory%\app\storage" copy "%Directory%\app\storage" __storage /Y
if exist "%Directory%" rmdir "%Directory%" /S/Q
if not exist "%Directory%\*" md "%Directory%"

xcopy app "%Directory%\app\" /E/Y
xcopy CSXS "%Directory%\CSXS\" /E/Y
xcopy icons "%Directory%\icons\" /E/Y
xcopy locale "%Directory%\locale\" /E/Y
if exist .debug copy .debug "%Directory%\.debug" /Y
if exist __storage (
    copy __storage "%Directory%\app\storage" /Y
    del __storage /F
)

echo. & echo.
echo Installation completed.
echo Open Photoshop and in the upper menu click the following: [Window] ^> [Extensions] ^> [Typer Tools]
echo.

PAUSE