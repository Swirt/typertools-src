TITLE Typer Tools Pack

SET name=typertools
SET sert=selfDB.p12
SET pass=12345

del %sert%
del %name%.zxp
rmdir %name% /S/Q

xcopy app %name%\app\ /E/Y/C
xcopy host %name%\host\ /E/Y/C
xcopy CSXS %name%\CSXS\ /E/Y/C
xcopy icons %name%\icons\ /E/Y/C
xcopy locale %name%\locale\ /E/Y/C

ZXPSignCmd -selfSignedCert RU SPB 34squad "34th squad" %pass% %sert%
ZXPSignCmd -sign %name% %name%.zxp %sert% %pass% -tsa http://timestamp.digicert.com/

rmdir %name% /S/Q
del %sert%
del .rnd

PAUSE