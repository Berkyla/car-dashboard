@echo off
chcp 65001 > nul

echo Запуск C# backend...
start "" ".\СontrolBlock\СontrolBlock\bin\Release\net8.0-windows\СontrolBlock.exe"

echo Подготовка скрипта для запуска npm start...
echo cd /d car-dashboard > start_frontend.bat
echo call npm start >> start_frontend.bat

echo Создание скрытого запуска через VBS...
echo Set WshShell = CreateObject("WScript.Shell") > run_silently.vbs
echo WshShell.Run chr(34) ^& "start_frontend.bat" ^& chr(34), 0 >> run_silently.vbs
echo Set WshShell = Nothing >> run_silently.vbs

wscript.exe run_silently.vbs

timeout /t 5 > nul

echo Открытие браузера...
start http://localhost:1234

timeout /t 1 > nul
del start_frontend.bat
del run_silently.vbs

echo Ожидание завершения. Закрой окно, чтобы остановить Node.js...
pause

taskkill /IM node.exe /F > nul 2>&1
