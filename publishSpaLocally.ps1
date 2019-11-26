##npm install
npm run-script build

$appFolderPath = "..\..\CalculateFunding.Frontend\wwwroot\app"

if(Test-Path $appFolderPath -PathType Container){
    Remove-Item $appFolderPath -Force -Confirm:$false -Recurse
}

$buildFolderPath = "..\..\CalculateFunding.Frontend\wwwroot\build"
if(Test-Path $buildFolderPath -PathType Container){
    rm $buildFolderPath -Force -Confirm:$false -Recurse
}


cp build -Destination ..\..\CalculateFunding.Frontend\wwwroot -Recurse
mv ..\..\CalculateFunding.Frontend\wwwroot\build ..\..\CalculateFunding.Frontend\wwwroot\app