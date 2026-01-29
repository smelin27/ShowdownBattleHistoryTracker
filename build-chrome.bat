:: Build script for Chrome on Windows.
@ECHO OFF
cd %~dp0

rmdir "build-chrome" /s /q
mkdir "build-chrome"
mkdir "build-chrome\images"

copy "src\chrome\*" "build-chrome"
copy "src\content\*" "build-chrome"
copy "src\images\icon-*" "build-chrome\images"
