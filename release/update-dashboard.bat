@echo off
title TZG Dashboard Update

echo.
echo =====================================
echo TZG Dashboard wordt bijgewerkt
echo =====================================
echo.

cd /d C:\TZG-Dashboard

echo Broncode ophalen...
git pull

if errorlevel 1 (
    echo.
    echo FOUT: Git pull mislukt.
    pause
    exit /b 1
)

echo.
echo Afhankelijkheden controleren...
call npm install

if errorlevel 1 (
    echo.
    echo FOUT: npm install mislukt.
    pause
    exit /b 1
)

echo.
echo Build uitvoeren...
call npm run build

if errorlevel 1 (
    echo.
    echo FOUT: Build mislukt.
    pause
    exit /b 1
)

echo.
echo =====================================
echo Update succesvol voltooid
echo =====================================
echo.

pause