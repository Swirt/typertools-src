setlocal EnableDelayedExpansion

for /l %%x in (4, 1, 12) do (
    reg query HKEY_CURRENT_USER\SOFTWARE\Adobe\CSXS.%%x
    if !errorlevel! equ 0 (
        reg add HKEY_CURRENT_USER\SOFTWARE\Adobe\CSXS.%%x /t REG_SZ /v PlayerDebugMode /d 1 /f
    )
)

set Directory="%HOMEDRIVE%%HOMEPATH%\AppData\Roaming\Adobe\CEP\extensions"
if not exist "%Directory%\*" md "%Directory%"
rmdir "%Directory%\typertools" /S/Q
xcopy typertools "%Directory%\typertools\" /S/E/Y

PAUSE