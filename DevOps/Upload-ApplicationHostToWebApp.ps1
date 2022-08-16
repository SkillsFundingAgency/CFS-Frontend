<#
.SYNOPSIS
Uploads an applicationhost.xdt to an azure web app.

This script depends on AZ cli being available

.DESCRIPTION
Uploads an applicationhost.xdt to an azure web app.

.PARAMETER ResourceGroupName
The name of the resource group containing the web app.

.PARAMETER WebAppName
The name of the web app to upload the file to

.PARAMETER SourcePath
The path to the file to upload

.PARAMETER TargetPath
The full path to the final location of the file (including it's name) from d:\home dir on the app service


.EXAMPLE
Upload-ApplicationHostToWebApp.ps1 -ResourceGroup someResourceGroup -WebAppName SomeWebApp -SourcePath c:\applicationhost.xdt -TargetPath /site/applicationhost.xdt

#>
[CmdletBinding()]
Param(
    [Parameter(Mandatory=$true)]
    [string] $ResourceGroupName,
    [Parameter(Mandatory=$true)]
    [string] $WebAppName,
    [Parameter(Mandatory=$true)]
    [string] $SourcePath,
    [Parameter(Mandatory=$true)]
    [string] $TargetPath
)

# Ensure file exists

if(-not (Test-Path -Path $SourcePath)) {
    Write-Error "Could not find file to upload"
    throw "Could not find file to upload: $SourcePath"
}

# Get web app publishing credentials
$credentials = az webapp deployment list-publishing-credentials -n $WebAppName -g $ResourceGroupName --query '{publishingUserName:publishingUserName, publishingPassword:publishingPassword}'
$credsObject = $credentials | ConvertFrom-Json

# Create basic auth header
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $credsObject.publishingUserName, $credsObject.publishingPassword)))

$headers = @{
    Authorization=("Basic {0}" -f $base64AuthInfo)
    "If-Match" = "*"
}

# And upload the file, overwriting it if it already exists.

$kuduUrl = "https://$($WebAppName).scm.azurewebsites.net/api/vfs/$TargetPath"

Invoke-RestMethod -Uri $kuduUrl `
    -Headers $headers `
    -Method PUT `
    -InFile $SourcePath `
    -ContentType "multipart/form-data"