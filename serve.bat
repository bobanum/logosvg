@echo off

set fic=%~nx0
set chemin=%~dp0

FOR /F "tokens=2,3 delims=." %%I IN ("%fic%") DO (
    if not "%%i"=="bat" (
		set port=8000
	) else (
		set port=%%I
	)
)

cd %chemin%
:checkport
netstat -an |find "%port%" >nul
if ERRORLEVEL 1 (
	rem "pas pris"
) else (
	echo "Le port '%port%' est pris."
	set /A port=port+1
	goto checkport
)

rem brackets . &
rem start "" http://localhost:%port% &
C:\wamp64\bin\php\php7.0.10\php.exe -S 0.0.0.0:%port%
