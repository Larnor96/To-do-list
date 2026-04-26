$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$electronPath = Join-Path $projectRoot "node_modules\.bin\electron.cmd"
$indexPath = Join-Path $projectRoot "out\index.html"

Set-Location $projectRoot

if (-not (Test-Path $indexPath)) {
  npm.cmd run build
}

Start-Process -FilePath $electronPath -ArgumentList "." -WorkingDirectory $projectRoot
