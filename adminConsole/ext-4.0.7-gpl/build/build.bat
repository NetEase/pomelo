@echo off

set ERROR=0
set DEPLOY_DIR=%1
set BUILD_OPTION=%2

:: Error Check
IF "%DEPLOY_DIR%" == "" (
    set ERROR=1
) ELSE (
    IF "%BUILD_OPTION%" == "" (
        :: Empty second arg, build sdk/all
        ..\..\jsbuilder\JSBuilder.bat --projectFile %CD%\sdk.jsb3 --deployDir %DEPLOY_DIR% --verbose"
        ..\..\jsbuilder\JSBuilder.bat --projectFile %DEPLOY_DIR%\ext-all.jsb3 --deployDir %DEPLOY_DIR% --verbose"
    ) ELSE (
        IF "%BUILD_OPTION%" == "sdk" (
            echo %CD%
            ..\..\jsbuilder\JSBuilder.bat --projectFile %CD%\sdk.jsb3 --deployDir %DEPLOY_DIR% --verbose"
        ) ELSE IF "%BUILD_OPTION%" == "ext-all" (
            ..\..\jsbuilder\JSBuilder.bat --projectFile %DEPLOY_DIR%\ext-all.jsb3 --deployDir %DEPLOY_DIR% --verbose"
        ) ELSE IF "%BUILD_OPTION%" == "sass" (
            compass compile resources/sass -f
        ) ELSE (
            set ERROR=1
        )
    )

)

IF %ERROR% == 1 (
    echo Usage: build.bat DEPLOY_DIR [TYPE]
    echo.
    echo The type option can be one of the following:
    echo sdk     - Build the whole Ext SDK
    echo ext-all - Build just the files required for Ext to run
    echo sass    - Build css files. Assumes compass is installed
)