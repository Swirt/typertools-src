TITLE Typer Tools Pack

set /p version=Version: 
SET name=typertools-%version%
SET tmpDir=tmpPackDir
SET sert=selfDB.p12
SET pass=12345

del %sert%
del %name%.zxp
rmdir %tmpDir% /S/Q

xcopy app %tmpDir%\app\ /E/Y/C
xcopy CSXS %tmpDir%\CSXS\ /E/Y/C
xcopy icons %tmpDir%\icons\ /E/Y/C
xcopy locale %tmpDir%\locale\ /E/Y/C

ZXPSignCmd -selfSignedCert RU SPB 34squad "34th squad" %pass% %sert%
ZXPSignCmd -sign %tmpDir% %name%.zxp %sert% %pass% -tsa http://timestamp.digicert.com/

rmdir %tmpDir% /S/Q
del %sert%
del .rnd

PAUSE