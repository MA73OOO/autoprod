#define MyAppName "AutoProd Motor Local"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "AutoProd AI"
#define MyAppURL "https://autoprod.io"
#define MyAppExeName "autoprod-motor.exe"

[Setup]
AppId={{D649A327-048F-4DF9-9159-8802E29FE41B}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\AutoProdAI
DisableDirPage=no
DisableProgramGroupPage=yes
OutputBaseFilename=AutoProd-Setup
OutputDir=..\..\..\dist
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "..\..\..\dist\autoprod-motor.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\..\bin\*"; DestDir: "{app}\bin"; Flags: ignoreversion recursesubdirs createallsubdirs

[Dirs]
Name: "{app}\workspace"
Name: "{app}\bin"

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\AutoProd Motor"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigFile: String;
  ConfigContent: String;
  AppPath: String;
  WorkspacePath: String;
  BinPath: String;
begin
  if CurStep = ssPostInstall then
  begin
    AppPath := ExpandConstant('{app}');
    ConfigFile := AppPath + '\.autoprod-config.json';
    WorkspacePath := AppPath + '\workspace';
    BinPath := AppPath + '\bin';
    
    StringChangeEx(WorkspacePath, '\', '\\', True);
    StringChangeEx(BinPath, '\', '\\', True);

    ConfigContent := '{' + #13#10 +
      '  "basePath": "' + WorkspacePath + '",' + #13#10 +
      '  "binPath": "' + BinPath + '",' + #13#10 +
      '  "version": "1.0.0"' + #13#10 +
      '}';

    SaveStringToFile(ConfigFile, ConfigContent, False);
  end;
end;
