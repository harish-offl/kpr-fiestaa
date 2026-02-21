const axios = require('axios');

const API_URL = 'http://localhost:5000/api/blockchain/add';

// Sample supply chain journey for a batch
const sampleJourney = [
  {
    batchID: 'BATCH-2024-RICE-001',
    farmerID: 'FARMER-PB-001',
    location: 'Punjab',
    temperature: 22.5,
    quantity: 1000,
    handlerRole: 'Farmer',
    crop: 'Rice'
  },
  {
    batchID: 'BATCH-2024-RICE-001',
    farmerID: 'FARMER-PB-001',
    location: 'Delhi',
    temperature: 24.0,
    quantity: 995,
    handlerRole: 'Distributor',
    crop: 'Rice'
  },
  {
    batchID: 'BATCH-2024-RICE-001',
    farmerID: 'FARMER-PB-001',
    location: 'Mumbai',
    temperature: 26.5,
    quantity: 990,
    handlerRole: 'Distributor',
    crop: 'Rice'
  },
  {
    batchID: 'BATCH-2024-RICE-001',
    farmerID: 'FARMER-PB-001',
    location: 'Bangalore',
    temperature: 23.0,
    quantity: 985,
    handlerRole: 'Retailer',
    crop: 'Rice'
  }
];

// Second batch
const sampleJourney2 = [
  {
    batchID: 'BATCH-2024-WHEAT-002',
    farmerID: 'FARMER-GJ-002',
    location: 'Gujarat',
    temperature: 21.0,
    quantity: 800,
    handlerRole: 'Farmer',
    crop: 'Wheat'
  },
  {
    batchID: 'BATCH-2024-WHEAT-002',
    farmerID: 'FARMER-GJ-002',
    location: 'Maharashtra',
    temperature: 25.0,
    quantity: 795,
    handlerRole: 'Distributor',
    crop: 'Wheat'
  },
  {
    batchID: 'BATCH-2024-WHEAT-002',
    farmerID: 'FARMER-GJ-002',
    location: 'Hyderabad',
    temperature: 24.5,
    quantity: 790,
    handlerRole: 'Retailer',
    crop: 'Wheat'
  }
];

async function addSampleData() {
  console.log('🌾 Adding sample supply chain data...\n');

  try {
    // Add first batch journey
    console.log('📦 Adding Batch 1: BATCH-2024-RICE-001');
    for (const transaction of sampleJourney) {
      await axios.post(API_URL, transaction);
      console.log(`  ✓ ${transaction.handlerRole} at ${transaction.location}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    }

    console.log('\n📦 Adding Batch 2: BATCH-2024-WHEAT-002');
    for (const transaction of sampleJourney2) {
      await axios.post(API_URL, transaction);
      console.log(`  ✓ ${transaction.handlerRole} at ${transaction.location}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    }

    console.log('\n✅ Sample data added successfully!');
    console.log('\n🎯 Now you can:');
    console.log('   1. Go to http://localhost:3000');
    console.log('   2. Click "Traceability" in the sidebar');
    console.log('   3. Scroll to "Individual Package Reports"');
    console.log('   4. Click "🚚 Transport Cost Analysis" button');
    console.log('\n💰 You will see complete transport cost breakdown including:');
    console.log('   - Total distance traveled');
    console.log('   - Transport cost per segment');
    console.log('   - Handling costs');
    console.log('   - Cost per KG');
    console.log('   - Downloadable detailed report\n');

  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
    console.log('\n⚠️  Make sure the backend server is running on port 5000');
  }
}

addSampleData();
