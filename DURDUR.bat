@echo off
chcp 65001 >nul
title DIDI Sosyal Durdur
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports=3000..3010; $items=Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $ports -contains $_.LocalPort }; $pids=$items.OwningProcess | Sort-Object -Unique; foreach($id in $pids){ try { $p=Get-Process -Id $id -ErrorAction Stop; if($p.ProcessName -eq 'node'){ Stop-Process -Id $id -Force; Write-Host ('Node islemi durduruldu: '+$id) } } catch{} }"
echo Tamamlandi.
pause
