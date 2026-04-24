$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$startupFolder = [Environment]::GetFolderPath("Startup")
$startupFile = Join-Path $startupFolder "LocalTodoApp.cmd"
$startScript = Join-Path $projectRoot "scripts\Start-TodoApp.ps1"

$cmdContent = @"
@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$startScript"
"@

Set-Content -Path $startupFile -Value $cmdContent -Encoding ASCII

Write-Host "Startup is enabled."
Write-Host "The app starts at next sign-in: $startupFile"

