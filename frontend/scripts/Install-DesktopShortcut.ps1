$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "Local Todo.lnk"
$targetScript = Join-Path $projectRoot "scripts\Start-TodoApp.ps1"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$targetScript`""
$shortcut.WorkingDirectory = $projectRoot
$shortcut.IconLocation = "shell32.dll,167"
$shortcut.Description = "Local todo app"
$shortcut.Save()

Write-Host "Desktop shortcut created: $shortcutPath"

