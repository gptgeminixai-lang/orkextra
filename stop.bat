@echo off
echo.
echo   Stopping ORKXTRA server ...
powershell -NoProfile -Command "$p = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*web-player*server.js*' }; if ($p) { $p | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host ('   stopped PID ' + $_.ProcessId) } } else { Write-Host '   ORKXTRA server was not running.' }"
echo.
pause
