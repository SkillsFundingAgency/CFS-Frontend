[CmdletBinding()]
Param(
    [Parameter(Mandatory=$true)]
    [string] $ResourceGroupName,
    [Parameter(Mandatory=$true)]
    [string] $WebAppName,
    [Parameter(Mandatory=$true)]
    [string] $SourcePath
)

# Ensure file exists

if(-not (Test-Path -Path $SourcePath)) {
    Write-Error "Could not find file to upload"
    throw "Could not find file to upload: $SourcePath"
}


# Get web app publishing credentials
$credentials = az webapp deployment list-publishing-credentials --name $webAppName --resource-group $ResourceGroupName --query '{publishingUserName:publishingUserName, publishingPassword:publishingPassword}'
$credsObject = $credentials | ConvertFrom-Json

# Create basic auth header
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $credsObject.publishingUserName, $credsObject.publishingPassword)))

#use the “If-Match”=”*” header to disable ETag version check on the server side
$headers = @{
    Authorization=("Basic {0}" -f $base64AuthInfo)
    "If-Match" = "*"
}

$kuduUrl = "https://$webAppName.scm.azurewebsites.net/api/vfs/site/wwwroot/app_offline.htm"

#Disable run Website from Package
az webapp config appsettings set -n $webAppName -g $ResourceGroupName --settings "WEBSITE_RUN_FROM_PACKAGE=0"
Start-Sleep 5

#upload app_offline.htm file
Invoke-RestMethod -Uri $kuduUrl -Headers $headers -Method PUT -infile $SourcePath -ContentType "multipart/form-data"

Write-Host "Offline Page now enabled"