@echo off
setlocal enabledelayedexpansion

echo Creating required directories...
mkdir "src\main\webapp\WEB-INF\views" 2>nul

echo Looking for asset files...
set ASSETS_DIR=src\main\webapp\WEB-INF\static\assets
set CSS_FILE=
set JS_FILE=

if not exist "%ASSETS_DIR%" (
    echo Assets directory not found: %ASSETS_DIR%
    echo Creating empty asset paths.
    set CSS_FILE=index.css
    set JS_FILE=index.js
) else (
    echo Assets directory found, searching for files.

    for /f "delims=" %%i in ('dir /b "%ASSETS_DIR%\index-*.css" 2^>nul') do (
        set CSS_FILE=%%i
        echo CSS file found: !CSS_FILE!
    )

    for /f "delims=" %%i in ('dir /b "%ASSETS_DIR%\index-*.js" 2^>nul') do (
        set JS_FILE=%%i
        echo JS file found: !JS_FILE!
    )
)

echo Generating home.jsp.
(
    echo ^<%%@ page contentType="text/html;charset=UTF-8" language="java" %%^>
    echo ^<!DOCTYPE html^>
    echo ^<html lang="en"^>
    echo ^<head^>
    echo     ^<meta charset="UTF-8"^>
    echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
    echo     ^<title^>My App^</title^>
    echo     ^<link rel="stylesheet" href="/static/assets/!CSS_FILE!"^>
    echo ^</head^>
    echo ^<body^>
    echo     ^<div id="root"^>^</div^>
    echo     ^<script src="/static/assets/!JS_FILE!"^>^</script^>
    echo ^</body^>
    echo ^</html^>
) > src\main\webapp\WEB-INF\views\home.jsp

echo Done!