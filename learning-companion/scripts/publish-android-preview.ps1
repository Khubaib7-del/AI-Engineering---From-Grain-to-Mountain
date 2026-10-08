param([string]$Tag = 'v1.1.0-preview.1')
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $appRoot
Set-Location -LiteralPath $repoRoot
$version = (Get-Content -LiteralPath (Join-Path $appRoot 'app.json') -Raw | ConvertFrom-Json).expo.version
if ($Tag -ne "v$version-preview.1") { throw 'Tag must match the packaged app version.' }
$apkName = "AI-Learning-$version-android-arm64.apk"
$apkFile = Join-Path $appRoot "releases/$apkName"
$digest = (Get-FileHash -LiteralPath $apkFile -Algorithm SHA256).Hash.ToLowerInvariant()
$head = (git rev-parse HEAD).Trim()
$remoteHead = ((git ls-remote origin refs/heads/main) -split '\s+')[0]
if ($LASTEXITCODE -ne 0 -or $remoteHead -ne $head) { throw 'Push and verify main before publishing the APK.' }
$credentialLines = "protocol=https`nhost=github.com`n`n" | git credential fill
if ($LASTEXITCODE -ne 0) { throw 'GitHub credential helper failed.' }
$fields = @{}
foreach ($line in $credentialLines) { $pair = $line -split '=',2; if ($pair.Count -eq 2) { $fields[$pair[0]]=$pair[1] } }
if (!$fields['password']) { throw 'GitHub authentication unavailable.' }
$headers = @{Authorization='Bearer '+$fields['password']; Accept='application/vnd.github+json'; 'X-GitHub-Api-Version'='2022-11-28'}
$api = 'https://api.github.com/repos/Khubaib7-del/AI-Engineering---From-Grain-to-Mountain'
$releases = @(Invoke-RestMethod -Uri "$api/releases" -Headers $headers -TimeoutSec 45)
$release = $releases | Where-Object tag_name -eq $Tag | Select-Object -First 1
$notes = @"
Update over the existing AI Learning app without uninstalling. Version $version/code 2 preserves its package and signing identity.

Sign in with the same account on web and Android. Native/web notes in both directions, offline SQLite and encrypted-session cold restart, explicit conflict choice, sign-out and preserved guest progress passed on Android 14 emulator and browser checks. Confirmation/password-reset links open the website; return to Android afterward. Guest import requires explicit replacement confirmation.

ARM64 Android 7.0+ personal preview, development-test signed. Physical-phone sync/notification verification of this update remains a device check; the owner previously tested 1.0 on two phones. This is not an iOS binary or Play Store release.

Website: https://ai-engineering-grain-to-mountain.vercel.app
Update instructions: https://github.com/Khubaib7-del/AI-Engineering---From-Grain-to-Mountain/blob/main/learning-companion/releases/UPDATE-1.1.md
SHA256: $digest
"@
if (!$release) {
 $body = @{tag_name=$Tag;target_commitish=$head;name="AI Learning $version — Android accounts and sync";draft=$true;prerelease=$true;body=$notes} | ConvertTo-Json
 $release = Invoke-RestMethod -Method Post -Uri "$api/releases" -Headers $headers -ContentType 'application/json' -Body $body -TimeoutSec 45
}
$uploadBase = $release.upload_url -replace '\{.*$',''
foreach ($name in @($apkName,'SHA256SUMS.txt')) {
 $file = Join-Path $appRoot "releases/$name"
 $existing = $release.assets | Where-Object name -eq $name | Select-Object -First 1
 if ($existing) {
  $expected = 'sha256:'+(Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($existing.digest -ne $expected) { throw "Existing release asset differs: $name. Do not overwrite silently." }
 } else {
  $asset = Invoke-RestMethod -Method Post -Uri ($uploadBase+'?name='+[uri]::EscapeDataString($name)) -Headers $headers -ContentType 'application/octet-stream' -InFile $file -TimeoutSec 240
  Write-Output $asset.browser_download_url
 }
}
$body = @{draft=$false;prerelease=$true;body=$notes} | ConvertTo-Json
$published = Invoke-RestMethod -Method Patch -Uri "$api/releases/$($release.id)" -Headers $headers -ContentType 'application/json' -Body $body -TimeoutSec 45
Write-Output $published.html_url
