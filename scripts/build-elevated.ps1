# Script: build-elevated.ps1
# Usage: Double-click or run from PowerShell. The script will re-run itself as Administrator if needed,
# change to the project dir, remove `.next` and run `pnpm -s build` with ExecutionPolicy bypass.

function Is-Administrator {
    $current = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($current)
    return $principal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

$scriptPath = $MyInvocation.MyCommand.Definition
if (-not (Is-Administrator)) {
    Write-Output "No admin rights. Relaunching as Administrator..."
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs
    exit
}

try {
    Write-Output "Running build with elevated privileges..."
    Set-Location -Path "F:\\APPLICATIONS\\MiabeSite\\miabesite"

    if (Test-Path '.next') {
        Write-Output "Removing existing .next directory..."
        Remove-Item -Recurse -Force .next
    }

    Write-Output "Starting pnpm build (this may take a few minutes)..."
    pnpm -s build

    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        Write-Error "Build exited with code $exitCode"
        exit $exitCode
    }

    Write-Output "Build finished successfully."
} catch {
    Write-Error "Build script failed: $_"
    exit 1
}
