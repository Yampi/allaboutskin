# tests/e2e/run_tests.ps1
# PowerShell wrapper for Allabout.skin E2E Test Suite Runner

param (
    [string]$Tier = "",
    [string]$Grep = "",
    [string]$File = "",
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$runnerPath = Join-Path $scriptDir "runner.mjs"

$nodeArgs = @($runnerPath)

if ($Tier -ne "") {
    $nodeArgs += "--tier=$Tier"
}

if ($Grep -ne "") {
    $nodeArgs += "--grep=$Grep"
}

if ($File -ne "") {
    $nodeArgs += "--file=$File"
}

if ($Verbose) {
    $nodeArgs += "--verbose"
}

Write-Host "Executing E2E Test Suite via Node.js..." -ForegroundColor Cyan
& node @nodeArgs

exit $LASTEXITCODE
