$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$appPath = Join-Path $projectRoot "scripts\TodoDesktop.ps1"

Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -STA -File `"$appPath`"" -WorkingDirectory $projectRoot
