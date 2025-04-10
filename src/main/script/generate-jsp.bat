@echo off
setlocal enabledelayedexpansion

echo Creating required directories...
mkdir "src\main\filter-resources" 2>nul
mkdir "src\main\webapp\WEB-INF\views" 2>nul

echo Looking for asset files...
set ASSETS_DIR=src\main\webapp\WEB-INF\static\assets
set CSS_FILE=
set JS_FILE=

if not exist "%ASSETS_DIR%" (
    echo Assets directory not found: %ASSETS_DIR%
    echo Creating empty asset paths...
    echo app.assets.maincss=assets/index.css> src\main\filter-resources\asset-paths.properties
    echo app.assets.mainjs=assets/index.js>> src\main\filter-resources\asset-paths.properties
) else (
    echo Assets directory found, searching for files...

    for /f "delims=" %%i in ('dir /b "%ASSETS_DIR%\index-*.css" 2^>nul') do (
        set CSS_FILE=%%i
        echo CSS file found: !CSS_FILE!
    )

    for /f "delims=" %%i in ('dir /b "%ASSETS_DIR%\index-*.js" 2^>nul') do (
        set JS_FILE=%%i
        echo JS file found: !JS_FILE!
    )

    echo Writing asset paths to properties file...
    echo app.assets.maincss=assets/!CSS_FILE!> src\main\filter-resources\asset-paths.properties
    echo app.assets.mainjs=assets/!JS_FILE!>> src\main\filter-resources\asset-paths.properties
)

echo Generating home.jsp...
(
    echo ^<%%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%%^>
    echo ^<%%@ taglib prefix="t" tagdir="/WEB-INF/tags" %%^>
    echo.
    echo ^<t:template title="Home Page"
    echo             mainCss="/static/assets/!CSS_FILE!"
    echo             mainJs="/static/assets/!JS_FILE!"^>
    echo.
    echo     ^<jsp:body^>
    echo         ^<div id="root"^>^</div^>
    echo.
    echo     ^</jsp:body^>
    echo ^</t:template^>
) > src\main\webapp\WEB-INF\views\home.jsp

echo Done!