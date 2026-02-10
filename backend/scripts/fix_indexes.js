const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Fallback if .env fails (local dev default)
const MONGO_URI = process.env.mongoDB_uri || 'mongodb://localhost:27017/attestify';

async function fixIndexes() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const collection = mongoose.connection.collection('credentials');
    
    console.log('Listing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    const targetIndex = 'studentId_1';
    if (indexes.find(i => i.name === targetIndex)) {
      console.log(`Found ghost index '${targetIndex}'. Dropping it...`);
      await collection.dropIndex(targetIndex);
      console.log(`Dropped index '${targetIndex}'.`);
    } else {
      console.log(`Index '${targetIndex}' not found. No action needed.`);
    }

    // Also check for 'registrationNumber_1' just in case
    // Drop compound ghost indexes
    const compoundIndexes = ['studentId_1_isRevoked_1', 'registrationNumber_1_isRevoked_1'];
    for (const indexName of compoundIndexes) {
        if (indexes.find(i => i.name === indexName)) {
            console.log(`Found ghost index '${indexName}'. Dropping it...`);
            await collection.dropIndex(indexName);
            console.log(`Dropped index '${indexName}'.`);
        }
    }

    console.log('Index fix complete.');
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

fixIndexes();
