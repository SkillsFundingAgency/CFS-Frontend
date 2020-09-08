[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string] $PathToZip,
    [Parameter(Mandatory=$true)]
    [string] $HandlerEnabled,
    [Parameter(Mandatory=$true)]
    [string] $BaseUrl,
    [Parameter(Mandatory=$true)]
    [string] $DebugOn,
    [Parameter(Mandatory=$true)]
    [string] $AppInsightsKey,
    [Parameter(Mandatory=$true)]
    [string] $TracingOn
)

function New-TemporaryDirectory {
    $parent = [System.IO.Path]::GetTempPath()
    [string] $name = [System.Guid]::NewGuid()
    New-Item -ItemType Directory -Path (Join-Path $parent $name)
}

function Update-ConfigFile {
    param(
        [string] $ConfigJsonPath,
        [string] $HandlerEnabled,
        [string] $BaseUrl,
        [string] $DebugOn,
        [string] $AppInsightsKey,
        [string] $TracingOn)

    $configObject = [ordered] @{
        "handlerEnabled" = [boolean]::Parse($HandlerEnabled)
        "loginType" = "aad"
        "baseUrl" = $BaseUrl
        "debugOn" = [boolean]::Parse($DebugOn)
        "appInsightsKey" = $AppInsightsKey
        "tracingOn" = [boolean]::Parse($TracingOn)}

    $configObject | ConvertTo-Json | Set-Content -Path $ConfigJsonPath
}


Write-Verbose "Creating new temporary directory to extract current deployment package into"
$TempFolder = New-TemporaryDirectory

Write-Verbose "Expanding deployment package to $TempFolder"
Expand-Archive -Path $PathToZip -DestinationPath $TempFolder

Write-Verbose "Updating react app configuration file"
Update-ConfigFile -ConfigJsonPath "$TempFolder\wwwroot\app\config.json" -BaseUrl $BaseUrl -DebugOn $DebugOn -TracingOn $TracingOn -HandlerEnabled $HandlerEnabled -AppInsightsKey $AppInsightsKey

Write-Verbose "Removing existing deployment package"
Remove-Item -Path $PathToZip -Force

Write-Verbose "Compressing deployment package with updated react configuration"
Compress-Archive -Path  "$TempFolder\*" -DestinationPath $PathToZip