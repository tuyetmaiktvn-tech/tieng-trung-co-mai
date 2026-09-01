param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))

$ErrorActionPreference = 'Stop'
$hskRoot = Join-Path $ProjectRoot 'hsk'
$output = Join-Path $ProjectRoot 'data\learning-resources.js'

function Find-SectionId {
  param([string]$Html, [string[]]$Candidates)
  foreach ($candidate in $Candidates) {
    if ($Html -match ('id=["'']' + [regex]::Escape($candidate) + '["'']')) { return $candidate }
  }
  return $null
}

$lessons = @()
Get-ChildItem $hskRoot -Filter 'hsk*-lesson*.html' -File | ForEach-Object {
  if ($_.BaseName -notmatch '^hsk([1-9])-lesson(\d+)$') { return }
  $level = [int]$Matches[1]
  $lesson = [int]$Matches[2]
  $html = Get-Content $_.FullName -Raw -Encoding utf8
  $title = if ($html -match '<title>(.*?)</title>') { $Matches[1] -replace '\s*\|.*$','' } else { "HSK $level - Lesson $lesson" }

  $vocabularyId = Find-SectionId $html @('tu-vung','tuvung','tu','vocabulary')
  $grammarId = Find-SectionId $html @('grammar','ngu-phap','nguphap','np')
  $exerciseId = Find-SectionId $html @('exercises','bai-tap','dien-tu','dientu','dien')
  $flashcardId = Find-SectionId $html @('flashcards')
  if (-not $vocabularyId -and $html -match '(?:"vocabulary"|\bvocabulary)\s*:') { $vocabularyId = 'vocabulary' }
  if (-not $grammarId -and $html -match '(?:"grammar"|\bpatterns)\s*:') { $grammarId = 'grammar' }
  if (-not $exerciseId -and $html -match '(?:"exercises"|\bexercises)\s*:') { $exerciseId = 'exercises' }
  if (-not $flashcardId -and $html -match '(?:"flashcards"|\bflashcards)\s*:') { $flashcardId = 'flashcards' }

  $lessons += [pscustomobject][ordered]@{
    level = $level
    lesson = $lesson
    title = $title
    url = "../hsk/$($_.Name)"
    vocabulary = $vocabularyId
    grammar = $grammarId
    exercises = $exerciseId
    flashcards = $flashcardId
  }
}

$lessons = @($lessons | Sort-Object -Property level,lesson)
$json = $lessons | ConvertTo-Json -Depth 5 -Compress
$content = "window.TCM_LEARNING_RESOURCES=$json;"
[System.IO.File]::WriteAllText($output,$content,[System.Text.UTF8Encoding]::new($false))
Write-Host "Synced $($lessons.Count) HSK lessons to data/learning-resources.js"
