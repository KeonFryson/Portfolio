# Run from the root of your portfolio folder:
#   powershell -ExecutionPolicy Bypass -File .\organize.ps1
# Tip: commit or back up first so you can undo with git if needed.

$ErrorActionPreference = 'Stop'

# 1. Create folders
New-Item -ItemType Directory -Force -Path css, js, assets\images, assets\docs | Out-Null

# 2. Move files (skips anything missing)
function Move-IfExists($from, $to) {
    if (Test-Path -LiteralPath $from) { Move-Item -LiteralPath $from -Destination $to -Force; Write-Host "moved  $from -> $to" }
    else { Write-Host "skip   $from (not found)" }
}
Move-IfExists 'style.css'    'css\style.css'
Move-IfExists 'script.js'    'js\script.js'
Move-IfExists 'projects.js'  'js\projects.js'
Move-IfExists 'Profile.jpg'  'assets\images\Profile.jpg'
Move-IfExists 'logo.png'     'assets\images\logo.png'
Move-IfExists 'FrysonKeonRsume(Coding).pdf' 'assets\docs\Keon-Fryson-Resume.pdf'   # also fixes the "Rsume" typo

# 3. Delete the already-applied patch file
if (Test-Path 'style-patch.css') { Remove-Item 'style-patch.css'; Write-Host 'removed style-patch.css' }

# 4. Update paths in every HTML file (literal replacements, saved as UTF-8)
$utf8 = New-Object System.Text.UTF8Encoding($false)
$swaps = @(
    @('href="style.css"',   'href="css/style.css"'),
    @('src="script.js"',    'src="js/script.js"'),
    @('src="projects.js"',  'src="js/projects.js"'),
    @('src="Profile.jpg"',  'src="assets/images/Profile.jpg"'),
    @('href="logo.png"',    'href="assets/images/logo.png"'),
    @('FrysonKeonRsume(Coding).pdf', 'assets/docs/Keon-Fryson-Resume.pdf')
)
Get-ChildItem -Filter *.html | ForEach-Object {
    $text = [IO.File]::ReadAllText($_.FullName)
    foreach ($s in $swaps) { $text = $text.Replace($s[0], $s[1]) }
    [IO.File]::WriteAllText($_.FullName, $text, $utf8)
    Write-Host "updated $($_.Name)"
}

Write-Host "`nDone. Open index.html through a local server (e.g. npx serve) and check each page."
