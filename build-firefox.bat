:: Build script for Firefox on Windows.
@ECHO OFF
cd %~dp0

rmdir "build-firefox" /s /q
mkdir "build-firefox"
mkdir "build-firefox\images"

copy "src\firefox\*" "build-firefox"
copy "src\content\*" "build-firefox"
copy "src\images\icon-*" "build-firefox\images"
