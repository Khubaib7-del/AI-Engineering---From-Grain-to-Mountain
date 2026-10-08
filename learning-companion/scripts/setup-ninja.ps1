$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $PSScriptRoot
$toolDir = Join-Path $appRoot 'tools/ninja'
New-Item -ItemType Directory -Force -Path $toolDir | Out-Null
$release = Invoke-RestMethod 'https://api.github.com/repos/ninja-build/ninja/releases/tags/v1.13.1'
$asset = $release.assets | Where-Object name -EQ 'ninja-win.zip'
if (!$asset -or !$asset.digest.StartsWith('sha256:')) { throw 'Official download digest missing.' }
$zipPath = Join-Path $toolDir 'ninja-win.zip'
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath
$actual = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -ne $asset.digest.Substring(7)) { throw 'Ninja archive checksum mismatch.' }
Expand-Archive -LiteralPath $zipPath -DestinationPath $toolDir -Force
Set-Content -LiteralPath (Join-Path $toolDir 'SOURCE.txt') -Value "$($asset.browser_download_url)`nSHA256: $actual"
& (Join-Path $toolDir 'ninja.exe') --version
