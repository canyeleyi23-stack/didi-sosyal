$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

try { $null = Get-Command node -ErrorAction Stop }
catch {
    Write-Host "Node.js bulunamadı. Node.js 20 veya üzerini kurun." -ForegroundColor Red
    Read-Host "Kapatmak için Enter"
    exit 1
}

$env:DATA_DIR = Join-Path $PSScriptRoot "data"
if (-not (Test-Path $env:DATA_DIR)) { New-Item -ItemType Directory -Path $env:DATA_DIR | Out-Null }
$adminFlag = Join-Path $env:DATA_DIR ".admin_initialized"

if (-not (Test-Path $adminFlag)) {
    Write-Host ""
    Write-Host "DİDİ Sosyal ilk yönetici kurulumu" -ForegroundColor Cyan
    Write-Host "Şifre ekranda görünmez ve belgelere yazılmaz."
    $username = Read-Host "Yönetici kullanıcı adı (önerilen: didiadmin)"
    if ([string]::IsNullOrWhiteSpace($username)) { $username = "didiadmin" }

    do {
        $secure1 = Read-Host "Yeni yönetici şifresi (en az 10 karakter)" -AsSecureString
        $secure2 = Read-Host "Şifreyi tekrar girin" -AsSecureString
        $ptr1 = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure1)
        $ptr2 = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure2)
        try {
            $plain1 = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr1)
            $plain2 = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr2)
        } finally {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr1)
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr2)
        }
        $valid = ($plain1.Length -ge 10 -and $plain1 -eq $plain2)
        if (-not $valid) { Write-Host "Şifreler eşleşmeli ve en az 10 karakter olmalı." -ForegroundColor Yellow }
    } until ($valid)

    $env:DIDI_ADMIN_USERNAME = $username
    $env:DIDI_ADMIN_PASSWORD = $plain1
    $env:DIDI_ADMIN_EMAIL = "admin@didi.local"
    node src\setup-admin.js
    if ($LASTEXITCODE -ne 0) { Read-Host "Kurulum başarısız. Enter"; exit 1 }
    Set-Content -Path $adminFlag -Value "initialized" -Encoding UTF8
    Remove-Item Env:\DIDI_ADMIN_PASSWORD -ErrorAction SilentlyContinue
    $plain1 = $null; $plain2 = $null
}

node src\launcher.js
if ($LASTEXITCODE -ne 0) { Read-Host "Başlatma hatası. Enter" }
