$startDate = [datetime]"2026-03-01"
$endDate   = [datetime]"2026-05-15"
$logFile   = Join-Path $PSScriptRoot "contribution_log.txt"

$existingDates = (git log --format="%ad" --date=format:"%Y-%m-%d" --after="2026-02-28" --before="2026-05-16") | Sort-Object -Unique
Write-Host "Existing commit days: $($existingDates.Count)" -ForegroundColor DarkGray

if (-not (Test-Path $logFile)) {
    "contribution log" | Set-Content $logFile -Encoding utf8
}

function Make-Commits {
    param([datetime]$Day, [int]$Count)
    $dateStr = $Day.ToString("yyyy-MM-dd")
    for ($i = 1; $i -le $Count; $i++) {
        $h  = Get-Random -Minimum 9  -Maximum 23
        $m  = Get-Random -Minimum 0  -Maximum 59
        $s  = Get-Random -Minimum 0  -Maximum 59
        $t  = $Day.AddHours($h).AddMinutes($m).AddSeconds($s)
        $ts = $t.ToString("yyyy-MM-dd HH:mm:ss +0900")
        Add-Content -Path $logFile -Value "$dateStr $i" -Encoding utf8
        git add contribution_log.txt | Out-Null
        $env:GIT_AUTHOR_DATE    = $ts
        $env:GIT_COMMITTER_DATE = $ts
        git commit -m "contribution: $dateStr ($i/$Count)" | Out-Null
        Write-Host "  [$dateStr] $i/$Count" -ForegroundColor Cyan
    }
}

$current = $startDate
$week    = @()
$total   = 0

Write-Host "Start..." -ForegroundColor Green

while ($current -le $endDate) {
    $week += $current

    if ($week.Count -eq 7 -or $current.Date -eq $endDate.Date) {
        $emptyDays = $week | Where-Object { $existingDates -notcontains $_.ToString("yyyy-MM-dd") }

        $skipCount = Get-Random -Minimum 1 -Maximum 3
        $skipCount = [Math]::Min($skipCount, [Math]::Max(0, $emptyDays.Count - 1))

        $skipDates = @()
        if ($skipCount -gt 0) {
            $skipDates = ($emptyDays | Get-Random -Count $skipCount) | ForEach-Object { $_.ToString("yyyy-MM-dd") }
        }

        foreach ($day in $emptyDays) {
            $ds = $day.ToString("yyyy-MM-dd")
            if ($skipDates -contains $ds) {
                Write-Host "  [$ds] skip" -ForegroundColor DarkGray
                continue
            }

            $rand = Get-Random -Minimum 0 -Maximum 3
            $commitCount = switch ($rand) {
                0 { 1 }
                1 { Get-Random -Minimum 4  -Maximum 7  }
                2 { Get-Random -Minimum 12 -Maximum 16 }
            }

            Write-Host "  [$ds] $commitCount commits" -ForegroundColor Yellow
            Make-Commits $day $commitCount
            $total += $commitCount
        }

        $week = @()
    }

    $current = $current.AddDays(1)
}

$env:GIT_AUTHOR_DATE    = $null
$env:GIT_COMMITTER_DATE = $null

Write-Host ""
Write-Host "Done! Total $total commits created." -ForegroundColor Green
Write-Host "Run: git push origin main" -ForegroundColor Yellow
