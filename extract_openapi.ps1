$json = Get-Content -Raw -Path "temp_repo/openapi.json" | ConvertFrom-Json

$results = foreach ($pathKey in $json.paths.PSObject.Properties.Name) {
    $pathItem = $json.paths.$pathKey
    foreach ($methodKey in $pathItem.PSObject.Properties.Name) {
        $operation = $pathItem.$methodKey
        $params = @()
        if ($operation.parameters) {
            foreach ($p in $operation.parameters) {
                if ($p.required -eq $true) { $params += "$($p.name)($($p.in))" }
            }
        }
        $reqBody = "N/A"
        if ($operation.requestBody.content.'application/json'.schema.'$ref') {
            $reqBody = $operation.requestBody.content.'application/json'.schema.'$ref'.Split('/')[-1]
        }
        $responses = @()
        if ($operation.responses) {
            foreach ($resKey in $operation.responses.PSObject.Properties.Name) {
                $ref = "N/A"
                if ($operation.responses.$resKey.content.'application/json'.schema.'$ref') { 
                    $ref = $operation.responses.$resKey.content.'application/json'.schema.'$ref'.Split('/')[-1] 
                }
                $responses += "${resKey}:${ref}"
            }
        }
        Write-Host "PATH: $pathKey | METHOD: $($methodKey.ToUpper()) | OPID: $($operation.operationId) | TAGS: $($operation.tags -join ',') | PARAMS: $($params -join ',') | BODY: $reqBody | RESP: $($responses -join ',')"
    }
}

Write-Host "`n--- Enums ---"
foreach ($enumName in @("AssetKind", "AssetMode", "IndividualStatus", "IndividualSex")) {
    if ($json.components.schemas.$enumName) {
        Write-Host "${enumName}: $($json.components.schemas.$enumName.enum -join ', ')"
    } else { Write-Host "${enumName}: Not found" }
}
