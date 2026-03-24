$ws = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
$shortcut = $ws.CreateShortcut($desktop + "\Digit Recognizer.lnk")
$shortcut.TargetPath = "C:\Users\403_29\AppData\Local\Programs\Python\Python311\pythonw.exe"
$shortcut.Arguments = "C:\Users\403_29\project_b\260323\digit_recognizer.py"
$shortcut.WorkingDirectory = "C:\Users\403_29\project_b\260323"
$shortcut.Description = "Handwritten Digit Recognizer"
$shortcut.IconLocation = "C:\Users\403_29\AppData\Local\Programs\Python\Python311\pythonw.exe,0"
$shortcut.Save()
Write-Host "Shortcut created at: $desktop\Digit Recognizer.lnk"
