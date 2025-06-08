@echo off
chcp 65001 > nul
echo Запуск C# backend...
start "" ".\СontrolBlock\СontrolBlock\bin\Release\net8.0-windows\СontrolBlock.exe"

echo Запуск TypeScript frontend...
cd /d car-dashboard
start "" npm start

pause
