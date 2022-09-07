[CmdletBinding()]
Param(
    [Parameter(Mandatory=$true)]
    [string] $ResourceGroupName,
    [Parameter(Mandatory=$true)]
    [string] $WebAppName
)

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

#Remove Offline Page
Invoke-RestMethod -Uri $kuduUrl -Headers $headers -Method DELETE -ContentType "multipart/form-data"

#Enable run Website from Package
az webapp config appsettings set -n $webAppName -g $ResourceGroupName --settings "WEBSITE_RUN_FROM_PACKAGE=1"
Start-Sleep 5

Write-Host "Offline Page was enabled, now removed"