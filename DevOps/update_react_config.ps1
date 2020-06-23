[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string] $PathToZip,
    [Parameter(Mandatory=$true)]
    [string] $TenantId,
    [Parameter(Mandatory=$true)]
    [string] $ClientId,
    [Parameter(Mandatory=$true)]
    [string] $Scope
)

function New-TemporaryDirectory {
    $parent = [System.IO.Path]::GetTempPath()
    [string] $name = [System.Guid]::NewGuid()
    New-Item -ItemType Directory -Path (Join-Path $parent $name)
}

function Update-ConfigFile {
    param(
        [string] $ConfigJsonPath,
        [string] $TenantId,
        [string] $ClientId,
        [string] $Scope)

    $configObject = [ordered] @{
        "handlerEnabled" = $true
        "tenantId" = $TenantId
        "clientId" = $ClientId
        "cacheLocation" = "sessionStorage"
        "scopes" = @(
            $scope
        )}

    $configObject | ConvertTo-Json | Set-Content -Path $ConfigJsonPath
}


Write-Verbose "Creating new temporary directory to extract current deployment package into"
$TempFolder = New-TemporaryDirectory

Write-Verbose "Expanding deployment package to $TempFolder"
Expand-Archive -Path $PathToZip -DestinationPath $TempFolder

Write-Verbose "Updating react app configuration file"
Update-ConfigFile -ConfigJsonPath "$TempFolder\wwwroot\app\config.json" -TenantId $TenantId -ClientId $ClientId -Scope $Scope

Write-Verbose "Removing existing deployment package"
Remove-Item -Path $PathToZip -Force

Write-Verbose "Compressing deployment package with updated react configuration"
Compress-Archive -Path  "$TempFolder\*" -DestinationPath $PathToZip