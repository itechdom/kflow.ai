@echo off
echo Setting up KFlow environment...
echo.

if not exist .env (
    echo Creating .env file...
    echo # OpenAI API Configuration > .env
    echo OPENAI_API_KEY=your_openai_api_key_here >> .env
    echo. >> .env
    echo # Server Configuration >> .env
    echo PORT=3001 >> .env
    echo.
    echo .env file created! Please edit it and add your OpenAI API key.
    echo.
) else (
    echo .env file already exists.
)

echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file and add your OpenAI API key
echo 2. Run 'npm run dev' to start the application
echo.
pause
