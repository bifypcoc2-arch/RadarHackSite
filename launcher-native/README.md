# Foresight native launcher

Native Windows WPF launcher styled after the Foresight esports broadcast interface. It verifies an existing private-server radar session through the site API and opens the matching personal radar URL.

## Build locally

Install the .NET 8 SDK on Windows, then run:

```powershell
dotnet publish .\Foresight.Launcher.csproj -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true
```

The executable will be under:

```text
bin\Release\net8.0-windows\win-x64\publish\Foresight.Launcher.exe
```

Change `launcher-config.json` when the website is not running on localhost.

The launcher does not read game memory or start/inject third-party game code. Live sessions are created by the legal private-server integration and opened by username plus session ID.
