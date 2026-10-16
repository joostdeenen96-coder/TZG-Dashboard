@echo off
setlocal EnableExtensions
chcp 65001 >nul
title TZG Dashboard naar GitHub

cd /d "%~dp0.." || (
  echo Projectmap niet gevonden.
  pause
  exit /b 1
)

where git >nul 2>&1
if errorlevel 1 (
  echo Git staat niet in PATH.
  pause
  exit /b 1
)

echo.
echo =====================================
echo Wijzigingen naar GitHub sturen
echo =====================================
echo.

git status --short
echo.

set "MSG="
set /p "MSG=Omschrijving van de wijziging (Enter = Dashboard bijgewerkt): "
if not defined MSG set "MSG=Dashboard bijgewerkt."

git add -A
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "%MSG%"
  if errorlevel 1 (
    echo.
    echo FOUT: Commit mislukt.
    pause
    exit /b 1
  )
) else (
  echo Geen nieuwe wijzigingen om te committen.
)

echo.
echo Laatste versie van GitHub ophalen...
git pull --rebase
if errorlevel 1 (
  echo.
  echo FOUT: Ophalen mislukt. Mogelijk botsen wijzigingen met GitHub.
  echo Los het conflict op, of breek af met: git rebase --abort
  pause
  exit /b 1
)

echo.
echo Versturen naar GitHub...
git push
if errorlevel 1 (
  echo.
  echo FOUT: Push mislukt. Controleer je GitHub-login en internetverbinding.
  pause
  exit /b 1
)

echo.
echo =====================================
echo Wijzigingen staan op GitHub
echo =====================================
echo.
pause
