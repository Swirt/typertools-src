TITLE Typer Tools Pack

SET name=com.swirt.typertools
SET sert=selfDB.p12
SET pass=98916062

SET /p ver=Version: 

del %sert%
del %name%.zxp
rmdir %name% /S/Q

xcopy app %name%\app\ /S/E/Y
xcopy CSXS %name%\CSXS\ /S/E/Y

ZXPSignCmd -selfSignedCert RU SPB 34squad "34th squad" %pass% %sert%
ZXPSignCmd -sign %name% %name%-%ver%.zxp %sert% %pass%

rmdir %name% /S/Q
del %sert%
del .rnd