@echo off
:: Handwritten Digit Recognizer - Launcher
:: Double-click this file to run the program without a console window

set PYTHON=C:\Users\403_29\AppData\Local\Programs\Python\Python311\pythonw.exe
set SCRIPT=%~dp0digit_recognizer.py

if not exist "%PYTHON%" (
    echo Python not found at: %PYTHON%
    pause
    exit /b 1
)

if not exist "%SCRIPT%" (
    echo Script not found at: %SCRIPT%
    pause
    exit /b 1
)

start "" "%PYTHON%" "%SCRIPT%"
