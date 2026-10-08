$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $PSScriptRoot
$apkSource = Join-Path $appRoot 'android/app/build/outputs/apk/release/app-release.apk'
if (!(Test-Path -LiteralPath $apkSource)) { throw 'Build assembleRelease successfully before packaging.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$apkArchive = [System.IO.Compression.ZipFile]::OpenRead($apkSource)
try {
    $entryNames = @($apkArchive.Entries.FullName)
    if ($entryNames -notcontains 'lib/arm64-v8a/libreactnative.so' -or $entryNames -notcontains 'assets/index.android.bundle') {
        throw 'Expected an ARM64 APK with bundled JavaScript. Rebuild with -PreactNativeArchitectures=arm64-v8a before packaging.'
    }
    if (@($entryNames | Where-Object { $_ -match '^lib/(?!arm64-v8a/)' }).Count -gt 0) {
        throw 'This packaging script expects an ARM64-only artifact; do not mislabel a different build.'
    }
} finally { $apkArchive.Dispose() }
$releaseRoot = Join-Path $appRoot 'releases'
New-Item -ItemType Directory -Force -Path $releaseRoot | Out-Null
$appVersion = (Get-Content -LiteralPath (Join-Path $appRoot 'app.json') -Raw | ConvertFrom-Json).expo.version
$apkName = "AI-Learning-$appVersion-android-arm64.apk"
$apkTarget = Join-Path $releaseRoot $apkName
Copy-Item -LiteralPath $apkSource -Destination $apkTarget
$digest = (Get-FileHash -LiteralPath $apkTarget -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content -LiteralPath (Join-Path $releaseRoot 'SHA256SUMS.txt') -Value "$digest  $apkName"
Write-Output "Packaged: $apkTarget"
Write-Output "SHA256: $digest"
