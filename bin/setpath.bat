@echo off

set KeyName=Path
set NewPath=%1

setx /M "%KeyName%" "%NewPath%";
