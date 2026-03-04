# =============================================================
#  CertifyChain  -  Test Report & Coverage Generator
#  Usage:  .\GenerateTestReport.ps1
#  Output: TestResults\  folder with HTML reports
# =============================================================

param(
    [string]$OutputDir = "TestResults"
)

$ErrorActionPreference = "Stop"
$projectDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$testProject = Join-Path $projectDir "CertifyChain.Tests.csproj"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CertifyChain Test Report Generator"     -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Clean previous results
$resultsPath = Join-Path $projectDir $OutputDir
if (Test-Path $resultsPath) {
    Remove-Item $resultsPath -Recurse -Force
}
New-Item -ItemType Directory -Path $resultsPath | Out-Null

$trxFile        = "TestResults.trx"
$trxPath        = Join-Path $resultsPath $trxFile
$coveragePath   = Join-Path $resultsPath "coverage.cobertura.xml"
$coverageReport = Join-Path $resultsPath "CoverageReport"
$htmlReport     = Join-Path $resultsPath "TestReport.html"

# --- 1. Run tests with TRX logger + code coverage ---------
Write-Host "[1/4] Running tests..." -ForegroundColor Yellow

dotnet test $testProject `
    --configuration Release `
    --logger "trx;LogFileName=$trxFile" `
    --collect:"XPlat Code Coverage" `
    --results-directory $resultsPath `
    --verbosity normal

if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests FAILED - check output above." -ForegroundColor Red
}

# --- 2. Locate coverage file coverlet wrote ----------------
Write-Host "[2/4] Locating code coverage data..." -ForegroundColor Yellow

$coverageFile = Get-ChildItem -Path $resultsPath -Recurse -Filter "coverage.cobertura.xml" | Select-Object -First 1
if ($null -eq $coverageFile) {
    Write-Host "  No coverage file found - skipping coverage report." -ForegroundColor DarkYellow
} else {
    Copy-Item $coverageFile.FullName $coveragePath -Force
    Write-Host "  Coverage file: $coveragePath" -ForegroundColor Green
}

# --- 3. Generate HTML coverage report ---------------------
if (Test-Path $coveragePath) {
    Write-Host "[3/4] Generating HTML coverage report..." -ForegroundColor Yellow

    $rgExists = Get-Command reportgenerator -ErrorAction SilentlyContinue
    if ($null -eq $rgExists) {
        Write-Host "  Installing ReportGenerator..." -ForegroundColor DarkYellow
        dotnet tool install -g dotnet-reportgenerator-globaltool | Out-Null
    }

    reportgenerator `
        "-reports:$coveragePath" `
        "-targetdir:$coverageReport" `
        "-reporttypes:Html;Badges;TextSummary" `
        "-title:CertifyChain Code Coverage"

    Write-Host "  Coverage report: $coverageReport\index.html" -ForegroundColor Green
} else {
    Write-Host "[3/4] Skipped - no coverage data." -ForegroundColor DarkYellow
}

# --- 4. Parse TRX and generate HTML test report -----------
Write-Host "[4/4] Generating HTML test report from TRX..." -ForegroundColor Yellow

# Find the TRX file
$trxActual = Get-ChildItem -Path $resultsPath -Filter "*.trx" -Recurse | Select-Object -First 1
if ($null -eq $trxActual) {
    Write-Host "  No TRX file found - cannot generate HTML report." -ForegroundColor Red
    exit 1
}

[xml]$trx = Get-Content $trxActual.FullName
$ns = @{ t = "http://microsoft.com/schemas/VisualStudio/TeamTest/2010" }

# Extract summary
$counters  = $trx.TestRun.ResultSummary.Counters
$total     = [int]$counters.total
$passed    = [int]$counters.passed
$failed    = [int]$counters.failed
$skipped   = $total - $passed - $failed
$outcome   = $trx.TestRun.ResultSummary.outcome

# Get timing
$times     = $trx.TestRun.Times
$startTime = [DateTime]::Parse($times.start)
$endTime   = [DateTime]::Parse($times.finish)
$duration  = $endTime - $startTime
$durationStr = "{0:mm\:ss\.fff}" -f $duration

# Collect test results
$testResults = @()
foreach ($result in $trx.TestRun.Results.UnitTestResult) {
    $fqn = $result.testName
    $parts = $fqn -split "\."
    $testName = $parts[-1]
    $className = if ($parts.Length -gt 1) { ($parts[0..($parts.Length - 2)] -join ".") } else { "" }

    $durationMs = 0
    if ($result.duration) {
        try {
            $ts = [TimeSpan]::Parse($result.duration)
            $durationMs = [math]::Round($ts.TotalMilliseconds, 1)
        } catch { $durationMs = 0 }
    }

    $testResults += [PSCustomObject]@{
        ClassName   = $className
        TestName    = $testName
        FullName    = $fqn
        Outcome     = $result.outcome
        DurationMs  = $durationMs
        ErrorMsg    = if ($result.Output -and $result.Output.ErrorInfo) { $result.Output.ErrorInfo.Message } else { "" }
        StackTrace  = if ($result.Output -and $result.Output.ErrorInfo) { $result.Output.ErrorInfo.StackTrace } else { "" }
    }
}

# Group by class
$grouped = $testResults | Group-Object ClassName | Sort-Object Name

# Determine pass rate
$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 1) } else { 0 }

# Build HTML
$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$testRowsHtml = ""
foreach ($group in $grouped) {
    $groupPassed  = ($group.Group | Where-Object { $_.Outcome -eq "Passed" }).Count
    $groupFailed  = ($group.Group | Where-Object { $_.Outcome -eq "Failed" }).Count
    $groupSkipped = ($group.Group | Where-Object { $_.Outcome -ne "Passed" -and $_.Outcome -ne "Failed" }).Count
    $groupTotal   = $group.Group.Count

    # Simplify class name for display
    $displayClass = $group.Name -replace "^CertifyChain\.Tests\.", ""

    $testRowsHtml += @"
        <tr class="group-header">
            <td colspan="3">
                <strong>$displayClass</strong>
                <span class="group-stats">$groupTotal tests | <span style="color:#22c55e">$groupPassed passed</span>$(if($groupFailed -gt 0){" | <span style='color:#ef4444'>$groupFailed failed</span>"})$(if($groupSkipped -gt 0){" | <span style='color:#eab308'>$groupSkipped skipped</span>"})</span>
            </td>
        </tr>
"@
    foreach ($t in ($group.Group | Sort-Object TestName)) {
        $badgeClass = switch ($t.Outcome) {
            "Passed"  { "pass" }
            "Failed"  { "fail" }
            default   { "skip" }
        }
        $badgeIcon = switch ($t.Outcome) {
            "Passed"  { "&#10003; Passed" }
            "Failed"  { "&#10007; Failed" }
            default   { "&#8709; Skipped" }
        }
        $errorRow = ""
        if ($t.ErrorMsg) {
            $escapedMsg = [System.Web.HttpUtility]::HtmlEncode($t.ErrorMsg)
            $errorRow = "<tr class=`"error-row`"><td colspan=`"3`"><pre>$escapedMsg</pre></td></tr>"
        }
        $testRowsHtml += @"
        <tr>
            <td class="test-name">$($t.TestName)</td>
            <td><span class="badge $badgeClass">$badgeIcon</span></td>
            <td class="duration">$($t.DurationMs) ms</td>
        </tr>
        $errorRow
"@
    }
}

# Read coverage summary if available
$coverageSummaryHtml = ""
$summaryFile = Join-Path $coverageReport "Summary.txt"
if (Test-Path $summaryFile) {
    $summaryLines = Get-Content $summaryFile
    $lineCov = ($summaryLines | Where-Object { $_ -match "Line coverage" }) -replace ".*:\s*", ""
    $branchCov = ($summaryLines | Where-Object { $_ -match "Branch coverage" }) -replace ".*:\s*", ""
    if ($lineCov) {
        $coverageSummaryHtml = @"
    <div class="section-title">Code Coverage</div>
    <div class="summary">
        <div class="card coverage"><div class="value">$lineCov</div><div class="label">Line Coverage</div></div>
        <div class="card coverage"><div class="value">$(if($branchCov){$branchCov}else{"N/A"})</div><div class="label">Branch Coverage</div></div>
    </div>
    <p style="color:#64748b;font-size:.85rem;margin-bottom:2rem;">Full coverage report: <code>TestResults/CoverageReport/index.html</code></p>
"@
    }
}

$statusColor = if ($failed -gt 0) { "#ef4444" } else { "#22c55e" }
$statusText  = if ($failed -gt 0) { "FAILED" } else { "PASSED" }

$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>CertifyChain Test Results</title>
    <style>
        :root{--pass:#22c55e;--fail:#ef4444;--skip:#eab308;--bg:#f8fafc;--card:#fff;--text:#1e293b;--muted:#64748b;--border:#e2e8f0}
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;padding:2rem}
        .container{max-width:1100px;margin:0 auto}
        h1{font-size:1.75rem;margin-bottom:.25rem}
        .subtitle{color:var(--muted);margin-bottom:2rem;font-size:.95rem}
        .status-badge{display:inline-block;padding:.2rem .8rem;border-radius:9999px;font-weight:700;font-size:.85rem;color:#fff;background:$statusColor;margin-left:.5rem;vertical-align:middle}
        .summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:2rem}
        .card{background:var(--card);border:1px solid var(--border);border-radius:.75rem;padding:1.25rem;text-align:center}
        .card .value{font-size:2rem;font-weight:700}
        .card .label{color:var(--muted);font-size:.8rem;text-transform:uppercase;letter-spacing:.05em}
        .card.passed .value{color:var(--pass)}
        .card.failed .value{color:var(--fail)}
        .card.skipped .value{color:var(--skip)}
        .card.rate .value{color:$statusColor;font-size:1.6rem}
        .card.duration .value{color:var(--text);font-size:1.4rem}
        .card.coverage .value{color:#3b82f6;font-size:1.6rem}
        .section-title{font-size:1.15rem;font-weight:600;margin:1.5rem 0 .75rem}
        table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--border);border-radius:.75rem;overflow:hidden;margin-bottom:2rem}
        thead th{background:#f1f5f9;text-align:left;padding:.65rem 1rem;font-weight:600;font-size:.8rem;text-transform:uppercase;letter-spacing:.03em;color:var(--muted);border-bottom:2px solid var(--border)}
        tbody td{padding:.5rem 1rem;border-bottom:1px solid var(--border);font-size:.88rem}
        tbody tr:last-child td{border-bottom:none}
        .group-header td{background:#f8fafc;font-size:.9rem;padding:.5rem 1rem;border-bottom:1px solid var(--border)}
        .group-stats{float:right;font-weight:400;font-size:.8rem;color:var(--muted)}
        .test-name{font-weight:500}
        .duration{color:var(--muted);font-size:.82rem;white-space:nowrap}
        .badge{display:inline-block;padding:.15rem .55rem;border-radius:9999px;font-size:.72rem;font-weight:600}
        .badge.pass{background:#dcfce7;color:#166534}
        .badge.fail{background:#fee2e2;color:#991b1b}
        .badge.skip{background:#fef9c3;color:#854d0e}
        .error-row td{background:#fef2f2;padding:.4rem 1rem}
        .error-row pre{font-size:.78rem;color:#991b1b;white-space:pre-wrap;word-break:break-word;margin:0}
        .footer{text-align:center;color:var(--muted);font-size:.8rem;margin-top:2rem;padding-top:1rem;border-top:1px solid var(--border)}
        @media print{body{padding:.5rem}table{page-break-inside:auto}tr{page-break-inside:avoid}}
    </style>
</head>
<body>
<div class="container">
    <h1>CertifyChain - Test Results <span class="status-badge">$statusText</span></h1>
    <p class="subtitle">Generated: $now | Duration: $durationStr | .NET 10</p>

    <div class="summary">
        <div class="card"><div class="value">$total</div><div class="label">Total Tests</div></div>
        <div class="card passed"><div class="value">$passed</div><div class="label">Passed</div></div>
        <div class="card failed"><div class="value">$failed</div><div class="label">Failed</div></div>
        <div class="card skipped"><div class="value">$skipped</div><div class="label">Skipped</div></div>
        <div class="card rate"><div class="value">$passRate%</div><div class="label">Pass Rate</div></div>
        <div class="card duration"><div class="value">$durationStr</div><div class="label">Duration</div></div>
    </div>

    $coverageSummaryHtml

    <div class="section-title">Test Details</div>
    <table>
        <thead><tr><th style="width:65%">Test</th><th style="width:15%">Result</th><th style="width:20%">Duration</th></tr></thead>
        <tbody>
$testRowsHtml
        </tbody>
    </table>

    <div class="footer">CertifyChain Test Suite - Blockchain Certificate Verification Platform</div>
</div>
</body>
</html>
"@

# Write HTML with UTF-8 encoding
[System.IO.File]::WriteAllText($htmlReport, $html, [System.Text.Encoding]::UTF8)

Write-Host "  Test report: $htmlReport" -ForegroundColor Green

# --- Final summary ----------------------------------------
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Report generation complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Reports saved to: $resultsPath" -ForegroundColor White
Write-Host ""
Write-Host "  [TEST REPORT]    $htmlReport" -ForegroundColor Green
Write-Host "  [TRX DATA]       $($trxActual.FullName)" -ForegroundColor Green
if (Test-Path "$coverageReport\index.html") {
    Write-Host "  [COVERAGE REPORT] $coverageReport\index.html" -ForegroundColor Green
}
Write-Host ""
Write-Host "  Tests: $passed passed, $failed failed, $skipped skipped ($total total)" -ForegroundColor White
Write-Host "  Pass Rate: $passRate%  Duration: $durationStr" -ForegroundColor White
Write-Host ""
