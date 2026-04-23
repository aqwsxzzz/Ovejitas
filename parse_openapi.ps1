$data = Get-Content temp_repo/openapi.json | ConvertFrom-Json
Write-Host "--- 1) Paths and Operations ---"
$data.paths.PSObject.Properties | ForEach-Object {
    $p = $_.Name
    Write-Host "Path: $p"
    $_.Value.PSObject.Properties | ForEach-Object {
        if ($_.Name -match "get|post|put|delete|patch") {
            $m = $_.Name.ToUpper()
            $id = $_.Value.operationId
            $tags = $_.Value.tags -join ", "
            Write-Output "  $m - id=$id - tags=$tags"
        }
    }
}
Write-Host "--- 2) Auth Schemas ---"
"LoginInput", "TokenPair", "OAuth2PasswordBearer" | ForEach-Object {
    $s = $_
    if ($data.components.schemas.$s) {
        Write-Host "$s :"
        $data.components.schemas.$s | ConvertTo-Json -Depth 2
    }
}
Write-Host "--- 3) Asset/Individual Schemas ---"
"AssetCreate", "AssetRead", "AssetUpdate", "IndividualCreate", "IndividualRead", "IndividualUpdate" | ForEach-Object {
    $s = $_
    if ($data.components.schemas.$s) {
        Write-Host "$s :"
        $data.components.schemas.$s | ConvertTo-Json -Depth 2
    }
}
Write-Host "--- Query Params (List) ---"
$paths = $data.paths.PSObject.Properties | Where-Object { $_.Name -match "assets$|individuals$" }
$paths | ForEach-Object {
    $p = $_.Name
    $params = $_.Value.get.parameters | Where-Object { $_.in -eq "query" } | ForEach-Object { $_.name }
    $pList = $params -join ", "
    Write-Host "Path: $p Params: ($pList)"
}
