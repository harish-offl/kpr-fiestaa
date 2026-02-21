# Comprehensive Sample Data for AgriChain Platform
Write-Host "Adding comprehensive sample data to AgriChain..." -ForegroundColor Green

$baseUrl = "http://localhost:5000/api/blockchain/add"

# Function to add transaction
function Add-Transaction {
    param($tx)
    $body = $tx | ConvertTo-Json
    Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -ContentType 'application/json' | Out-Null
    Write-Host "  Added: $($tx.handlerRole) at $($tx.location) - $($tx.quantity)kg" -ForegroundColor Gray
    Start-Sleep -Milliseconds 200
}

# Batch 1: Rice Journey
Write-Host "`nBatch 1: Premium Basmati Rice" -ForegroundColor Cyan
Add-Transaction @{batchID='BATCH-2024-RICE-001';farmerID='FARMER-PB-001';location='Punjab';temperature=22.5;quantity=1000;handlerRole='Farmer';crop='Rice'}
Add-Transaction @{batchID='BATCH-2024-RICE-001';farmerID='FARMER-PB-001';location='Delhi';temperature=24.0;quantity=995;handlerRole='Distributor';crop='Rice'}
Add-Transaction @{batchID='BATCH-2024-RICE-001';farmerID='FARMER-PB-001';location='Mumbai';temperature=26.5;quantity=990;handlerRole='Distributor';crop='Rice'}
Add-Transaction @{batchID='BATCH-2024-RICE-001';farmerID='FARMER-PB-001';location='Bangalore';temperature=23.0;quantity=985;handlerRole='Retailer';crop='Rice'}

# Batch 2: Wheat Journey
Write-Host "`nBatch 2: Organic Wheat" -ForegroundColor Cyan
Add-Transaction @{batchID='BATCH-2024-WHEAT-002';farmerID='FARMER-GJ-002';location='Gujarat';temperature=21.0;quantity=800;handlerRole='Farmer';crop='Wheat'}
Add-Transaction @{batchID='BATCH-2024-WHEAT-002';farmerID='FARMER-GJ-002';location='Maharashtra';temperature=25.0;quantity=795;handlerRole='Distributor';crop='Wheat'}
Add-Transaction @{batchID='BATCH-2024-WHEAT-002';farmerID='FARMER-GJ-002';location='Hyderabad';temperature=24.5;quantity=790;handlerRole='Retailer';crop='Wheat'}

# Batch 3: Corn Journey
Write-Host "`nBatch 3: Sweet Corn" -ForegroundColor Cyan
Add-Transaction @{batchID='BATCH-2024-CORN-003';farmerID='FARMER-PB-003';location='Punjab';temperature=20.5;quantity=1200;handlerRole='Farmer';crop='Corn'}
Add-Transaction @{batchID='BATCH-2024-CORN-003';farmerID='FARMER-PB-003';location='Delhi';temperature=22.0;quantity=1195;handlerRole='Distributor';crop='Corn'}
Add-Transaction @{batchID='BATCH-2024-CORN-003';farmerID='FARMER-PB-003';location='Hyderabad';temperature=26.0;quantity=1190;handlerRole='Distributor';crop='Corn'}
Add-Transaction @{batchID='BATCH-2024-CORN-003';farmerID='FARMER-PB-003';location='Chennai';temperature=28.0;quantity=1185;handlerRole='Retailer';crop='Corn'}

# Batch 4: Vegetables Journey
Write-Host "`nBatch 4: Fresh Vegetables" -ForegroundColor Cyan
Add-Transaction @{batchID='BATCH-2024-VEG-004';farmerID='FARMER-GJ-004';location='Gujarat';temperature=18.5;quantity=500;handlerRole='Farmer';crop='Vegetables'}
Add-Transaction @{batchID='BATCH-2024-VEG-004';farmerID='FARMER-GJ-004';location='Mumbai';temperature=20.0;quantity=495;handlerRole='Retailer';crop='Vegetables'}

# Batch 5: Rice with Temperature Violation
Write-Host "`nBatch 5: Rice (Temperature Violation)" -ForegroundColor Yellow
Add-Transaction @{batchID='BATCH-2024-RICE-005';farmerID='FARMER-MH-005';location='Maharashtra';temperature=22.0;quantity=900;handlerRole='Farmer';crop='Rice'}
Add-Transaction @{batchID='BATCH-2024-RICE-005';farmerID='FARMER-MH-005';location='Mumbai';temperature=32.5;quantity=895;handlerRole='Distributor';crop='Rice'}
Add-Transaction @{batchID='BATCH-2024-RICE-005';farmerID='FARMER-MH-005';location='Bangalore';temperature=29.0;quantity=890;handlerRole='Retailer';crop='Rice'}

# Batch 6: Wheat Journey
Write-Host "`nBatch 6: Premium Wheat" -ForegroundColor Cyan
Add-Transaction @{batchID='BATCH-2024-WHEAT-006';farmerID='FARMER-DL-006';location='Delhi';temperature=21.5;quantity=1100;handlerRole='Farmer';crop='Wheat'}
Add-Transaction @{batchID='BATCH-2024-WHEAT-006';farmerID='FARMER-DL-006';location='Hyderabad';temperature=25.5;quantity=1095;handlerRole='Distributor';crop='Wheat'}
Add-Transaction @{batchID='BATCH-2024-WHEAT-006';farmerID='FARMER-DL-006';location='Kolkata';temperature=27.0;quantity=1090;handlerRole='Retailer';crop='Wheat'}

# Batch 7: Corn Express
Write-Host "`nBatch 7: Express Corn" -ForegroundColor Cyan
Add-Transaction @{batchID='BATCH-2024-CORN-007';farmerID='FARMER-PB-007';location='Punjab';temperature=19.5;quantity=600;handlerRole='Farmer';crop='Corn'}
Add-Transaction @{batchID='BATCH-2024-CORN-007';farmerID='FARMER-PB-007';location='Delhi';temperature=21.0;quantity=598;handlerRole='Retailer';crop='Corn'}

# Batch 8: Vegetables Cold Chain
Write-Host "`nBatch 8: Premium Vegetables" -ForegroundColor Cyan
Add-Transaction @{batchID='BATCH-2024-VEG-008';farmerID='FARMER-BG-008';location='Bangalore';temperature=16.5;quantity=450;handlerRole='Farmer';crop='Vegetables'}
Add-Transaction @{batchID='BATCH-2024-VEG-008';farmerID='FARMER-BG-008';location='Chennai';temperature=18.0;quantity=448;handlerRole='Distributor';crop='Vegetables'}
Add-Transaction @{batchID='BATCH-2024-VEG-008';farmerID='FARMER-BG-008';location='Hyderabad';temperature=19.5;quantity=445;handlerRole='Retailer';crop='Vegetables'}

Write-Host "`nSample data added successfully!" -ForegroundColor Green
Write-Host "Total: 8 Batches, 27 Transactions" -ForegroundColor White
Write-Host "`nRefresh your browser to see all the data!" -ForegroundColor Yellow
