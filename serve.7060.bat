@echo off

set fic=%~nx0
set chemin=%~dp0

FOR /F "tokens=2,3 delims=." %%I IN ("%fic%") DO (
    if "%%I"=="bat" (
		set port=8000
	) else (
		set port=%%I
	)
)

cd %chemin%
:checkport
netstat -oan |findstr /c:":%port% " >nul
if %ERRORLEVEL% == 0 (
	echo Le port '%port%' est pris.
	set /A port=port+1
	goto checkport
)
echo On utilise le port '%port%'.

start "" http://localhost:%port%
php.exe -S 0.0.0.0:%port%