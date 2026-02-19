# Login and optionally trigger ODK sync (PowerShell)
# Usage:
#   .\scripts\login-and-sync.ps1
#   .\scripts\login-and-sync.ps1 -SyncOnly -Token "your-jwt-here"

param(
    [string]$Email = "pwaiswa@gmail.com",
    [string]$Password = "",
    [switch]$SyncOnly,
    [string]$Token = "",
    [string]$BaseUrl = "http://localhost:3000"
)

if ($SyncOnly) {
    if (-not $Token) {
        Write-Host "Error: -SyncOnly requires -Token" -ForegroundColor Red
        exit 1
    }
    $headers = @{ "Authorization" = "Bearer $Token" }
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/sync" -Method Post -Headers $headers
    $response | ConvertTo-Json
    exit 0
}

if (-not $Password) {
    $sec = Read-Host "Password" -AsSecureString
    $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

$body = @{ email = $Email; password = $Password } | ConvertTo-Json
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
} catch {
    $statusCode = $null
    if ($_.Exception -and $_.Exception.Response) { $statusCode = $_.Exception.Response.StatusCode.value__ }
    $errBody = ""
    if ($_.Exception -and $_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            if ($stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                $errBody = $reader.ReadToEnd()
                $reader.Dispose()
            }
        } catch { $errBody = $_.Exception.Message }
    }
    Write-Host "Login failed ($statusCode): $errBody" -ForegroundColor Red
    exit 1
}

Write-Host "Logged in. User: $($response.user.email)" -ForegroundColor Green
Write-Host "Token (use for Authorization: Bearer <token>):" -ForegroundColor Cyan
Write-Host $response.token

Write-Host "`nTrigger sync? (y/n)" -ForegroundColor Yellow
$sync = Read-Host
if ($sync -eq "y" -or $sync -eq "Y") {
    $headers = @{ "Authorization" = "Bearer $($response.token)" }
    try {
        $syncResult = Invoke-RestMethod -Uri "$BaseUrl/api/sync" -Method Post -Headers $headers
        Write-Host "Sync result:" -ForegroundColor Green
        $syncResult | ConvertTo-Json
    } catch {
        $statusCode = $null
        if ($_.Exception -and $_.Exception.Response) { $statusCode = $_.Exception.Response.StatusCode.value__ }
        $errBody = ""
        if ($_.Exception -and $_.Exception.Response) {
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $errBody = $reader.ReadToEnd()
                    $reader.Dispose()
                }
            } catch { $errBody = $_.Exception.Message }
        }
        Write-Host "Sync failed ($statusCode): $errBody" -ForegroundColor Red
        exit 1
    }
}
