@echo off
set "projectDir=%~dp0"

REM Install package dependencies
echo Installing package dependencies...
call npm install express mongoose bcryptjs jsonwebtoken
