# Script para ejecutar npm run dev con Node.js portable
$nodeDir = Join-Path $env:USERPROFILE "node-portable\node-v20.17.0-win-x64"

if (Test-Path $nodeDir) {
    Write-Host "✅ Configurando Node desde: $nodeDir" -ForegroundColor Green
    $env:Path = "$nodeDir;$nodeDir\node_modules\npm\bin;$env:Path"
    
    Write-Host ""
    Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Yellow
    Write-Host ""
    
    & "$nodeDir\npm.cmd" run dev
} else {
    Write-Host "❌ Node portable no encontrado en: $nodeDir" -ForegroundColor Red
    Write-Host "Por favor, verifica la ruta o instala Node.js" -ForegroundColor Yellow
}

