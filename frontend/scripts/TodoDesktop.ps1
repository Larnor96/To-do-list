$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$appDir = Join-Path $env:APPDATA "LocalTodoApp"
$oldAppDir = Join-Path $env:APPDATA "LokalTodoApp"
$dataFile = Join-Path $appDir "tasks.json"
$oldDataFile = Join-Path $oldAppDir "tasks.json"

if (-not (Test-Path $appDir)) {
  New-Item -ItemType Directory -Path $appDir | Out-Null
}

if (-not (Test-Path $dataFile) -and (Test-Path $oldDataFile)) {
  Copy-Item -Path $oldDataFile -Destination $dataFile
}

function Read-Tasks {
  if (-not (Test-Path $dataFile)) {
    return
  }

  try {
    $raw = Get-Content -Raw -Path $dataFile
    if ([string]::IsNullOrWhiteSpace($raw)) {
      return
    }

    $loaded = $raw | ConvertFrom-Json
    if ($null -eq $loaded) {
      return
    }

    foreach ($task in @($loaded)) {
      if ($null -ne $task -and -not [string]::IsNullOrWhiteSpace([string]$task.text)) {
        [pscustomobject]@{
          id = if ([string]::IsNullOrWhiteSpace([string]$task.id)) { [guid]::NewGuid().ToString() } else { [string]$task.id }
          text = [string]$task.text
          completed = [bool]$task.completed
          createdAt = if ($null -eq $task.createdAt) { [DateTimeOffset]::Now.ToUnixTimeMilliseconds() } else { $task.createdAt }
        }
      }
    }
  } catch {
    return
  }
}

function Save-Tasks {
  $tasksToSave = @($script:tasks)
  if ($tasksToSave.Count -eq 0) {
    Set-Content -Path $dataFile -Value "[]" -Encoding UTF8
    return
  }

  $tasksToSave |
    ConvertTo-Json -Depth 4 |
    Set-Content -Path $dataFile -Encoding UTF8
}

function Get-OpenTaskText {
  $openTasks = @($script:tasks | Where-Object { -not $_.completed }).Count

  if ($openTasks -eq 0) {
    return "No open tasks"
  }

  if ($openTasks -eq 1) {
    return "1 open task"
  }

  return "$openTasks open tasks"
}

$script:tasks = @(Read-Tasks)
$script:isRendering = $false

$form = New-Object System.Windows.Forms.Form
$form.Text = "Local Todo"
$form.StartPosition = "CenterScreen"
$form.Size = New-Object System.Drawing.Size(720, 620)
$form.MinimumSize = New-Object System.Drawing.Size(520, 420)
$form.BackColor = [System.Drawing.Color]::FromArgb(246, 244, 238)
$form.Font = New-Object System.Drawing.Font("Segoe UI", 10)

$title = New-Object System.Windows.Forms.Label
$title.Text = "Today's tasks"
$title.AutoSize = $true
$title.Location = New-Object System.Drawing.Point(24, 24)
$title.Font = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = [System.Drawing.Color]::FromArgb(22, 33, 45)

$counter = New-Object System.Windows.Forms.Label
$counter.AutoSize = $true
$counter.Location = New-Object System.Drawing.Point(28, 68)
$counter.ForeColor = [System.Drawing.Color]::FromArgb(95, 107, 119)

$taskInput = New-Object System.Windows.Forms.TextBox
$taskInput.Anchor = "Top,Left,Right"
$taskInput.Location = New-Object System.Drawing.Point(28, 108)
$taskInput.Size = New-Object System.Drawing.Size(520, 32)

$addButton = New-Object System.Windows.Forms.Button
$addButton.Anchor = "Top,Right"
$addButton.Text = "Add"
$addButton.Location = New-Object System.Drawing.Point(560, 106)
$addButton.Size = New-Object System.Drawing.Size(120, 36)
$addButton.BackColor = [System.Drawing.Color]::FromArgb(39, 63, 63)
$addButton.ForeColor = [System.Drawing.Color]::White
$addButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat

$taskList = New-Object System.Windows.Forms.ListView
$taskList.Anchor = "Top,Bottom,Left,Right"
$taskList.Location = New-Object System.Drawing.Point(28, 164)
$taskList.Size = New-Object System.Drawing.Size(652, 330)
$taskList.View = [System.Windows.Forms.View]::Details
$taskList.CheckBoxes = $true
$taskList.FullRowSelect = $true
$taskList.HideSelection = $false
$taskList.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$taskList.Columns.Add("Task", 610) | Out-Null

$deleteButton = New-Object System.Windows.Forms.Button
$deleteButton.Anchor = "Bottom,Right"
$deleteButton.Text = "Delete selected"
$deleteButton.Location = New-Object System.Drawing.Point(426, 514)
$deleteButton.Size = New-Object System.Drawing.Size(120, 36)

$clearButton = New-Object System.Windows.Forms.Button
$clearButton.Anchor = "Bottom,Right"
$clearButton.Text = "Clear completed"
$clearButton.Location = New-Object System.Drawing.Point(560, 514)
$clearButton.Size = New-Object System.Drawing.Size(120, 36)

function Render-Tasks {
  $script:isRendering = $true
  $taskList.BeginUpdate()
  $taskList.Items.Clear()

  foreach ($task in $script:tasks) {
    $item = New-Object System.Windows.Forms.ListViewItem($task.text)
    $item.Tag = $task.id
    $item.Checked = [bool]$task.completed

    if ($task.completed) {
      $item.ForeColor = [System.Drawing.Color]::FromArgb(123, 133, 143)
      $item.Font = New-Object System.Drawing.Font($taskList.Font, [System.Drawing.FontStyle]::Strikeout)
    }

    $taskList.Items.Add($item) | Out-Null
  }

  $taskList.EndUpdate()
  $counter.Text = Get-OpenTaskText
  $script:isRendering = $false
}

function Add-Task {
  $text = ([string]$taskInput.Text).Trim()
  if ([string]::IsNullOrWhiteSpace($text)) {
    return
  }

  $newTask = [pscustomobject]@{
    id = [guid]::NewGuid().ToString()
    text = $text
    completed = $false
    createdAt = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
  }

  $script:tasks = @($newTask) + @($script:tasks)
  if ($null -ne $taskInput) {
    $taskInput.Clear()
  }
  Save-Tasks
  Render-Tasks
}

$addButton.Add_Click({
  try {
    Add-Task
  } catch {
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, "Local Todo") | Out-Null
  }
})
$taskInput.Add_KeyDown({
  param($sender, $eventArgs)

  if ($eventArgs.KeyCode -eq [System.Windows.Forms.Keys]::Enter) {
    $eventArgs.SuppressKeyPress = $true
    try {
      Add-Task
    } catch {
      [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, "Local Todo") | Out-Null
    }
  }
})

$taskList.Add_ItemChecked({
  param($sender, $eventArgs)

  if ($script:isRendering) {
    return
  }

  if ($null -eq $eventArgs -or $null -eq $eventArgs.Item) {
    return
  }

  $changedId = $eventArgs.Item.Tag
  foreach ($task in $script:tasks) {
    if ($task.id -eq $changedId) {
      $task.completed = $eventArgs.Item.Checked
      break
    }
  }

  Save-Tasks
  Render-Tasks
})

$deleteButton.Add_Click({
  try {
    if ($null -eq $taskList) {
      return
    }

    $selectedIds = @()

    foreach ($item in $taskList.SelectedItems) {
      if ($null -ne $item.Tag) {
        $selectedIds += $item.Tag
      }
    }

    if ($selectedIds.Count -eq 0 -and $null -ne $taskList.FocusedItem -and $null -ne $taskList.FocusedItem.Tag) {
      $selectedIds += $taskList.FocusedItem.Tag
    }

    if ($selectedIds.Count -eq 0) {
      foreach ($item in $taskList.CheckedItems) {
        if ($null -ne $item.Tag) {
          $selectedIds += $item.Tag
        }
      }
    }

    if ($selectedIds.Count -eq 0) {
      return
    }

    $script:tasks = @($script:tasks | Where-Object { $selectedIds -notcontains $_.id })
    Save-Tasks
    Render-Tasks
  } catch {
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, "Local Todo") | Out-Null
  }
})

$clearButton.Add_Click({
  try {
    $script:tasks = @($script:tasks | Where-Object { -not $_.completed })
    Save-Tasks
    Render-Tasks
  } catch {
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, "Local Todo") | Out-Null
  }
})

$form.Controls.AddRange(@(
  $title,
  $counter,
  $taskInput,
  $addButton,
  $taskList,
  $deleteButton,
  $clearButton
))

$form.Add_Shown({
  Render-Tasks
  $taskInput.Focus()
})

[void]$form.ShowDialog()

