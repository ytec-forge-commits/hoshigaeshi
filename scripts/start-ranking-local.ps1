param([int]$Port = 8879)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
if ($Port -lt 1024 -or $Port -gt 65535) { throw 'Choose a loopback test port above 1023.' }
if (Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue) { throw 'That port already has a listener. Do not stop it automatically.' }
$taskPhp = (Get-Command php -ErrorAction Stop).Source
$taskExt = Join-Path (Split-Path -Parent $taskPhp) 'ext'
$env:STAR_REBOUND_SERVER_DIR = Join-Path $projectRoot 'server'
$env:STAR_REBOUND_DATA_DIR = Join-Path $projectRoot "development/qa-ranking-$Port"
$env:STAR_REBOUND_ALLOWED_ORIGIN = "http://127.0.0.1:$Port"
# Process-local extensions only. No php.ini or OS-wide settings are changed.
& $taskPhp -d "extension_dir=$taskExt" -d extension=php_pdo_sqlite.dll -d extension=php_mbstring.dll -d display_errors=0 -S "127.0.0.1:$Port" -t (Join-Path $projectRoot 'source')
