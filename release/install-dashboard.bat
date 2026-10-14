@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0.." || (
  echo Projectmap niet gevonden.
  exit /b 1
)
if not exist "package.json" (
  echo package.json ontbreekt. Zet de map release in de projectmap van het dashboard.
  exit /b 1
)
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js staat niet in PATH.
  echo Installeer de LTS-versie van https://nodejs.org/ en open daarna een nieuw opdrachtvenster.
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo npm ontbreekt. Installeer Node.js opnieuw.
  exit /b 1
)
if not exist ".env" (
  copy /Y "%~dp0.env.example" ".env" >nul
  echo .env aangemaakt. Vul GRAPH_TENANT_ID, GRAPH_CLIENT_ID en GRAPH_CLIENT_SECRET in voor je start.
) else (
  echo .env bestaat al en is niet overschreven.
)
echo Afhankelijkheden installeren. Dit venster moet open blijven tot npm klaar is.
call npm.cmd install
if errorlevel 1 (
  echo npm install is mislukt.
  exit /b 1
)
echo Installatie klaar. Start daarna release\start-dashboard.bat.
exit /b 0
