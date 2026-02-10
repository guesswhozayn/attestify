const mongoose = require('mongoose');
const Credential = require('./src/models/Credential');
const User = require('./src/models/User');

// Connect to DB (update URI as needed, assuming local or from env)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attestify')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

async function checkPopulate() {
  try {
    const credentials = await Credential.find().limit(1).populate('issuedBy', 'name email university instituteDetails');
    
    if (credentials.length === 0) {
      console.log('No credentials found.');
      return;
    }

    const cert = credentials[0];
    console.log('Credential ID:', cert._id);
    console.log('Issued By:', cert.issuedBy?.name);
    console.log('Institute Details Present:', !!cert.issuedBy?.instituteDetails);
    
    if (cert.issuedBy?.instituteDetails) {
       console.log('Branding:', cert.issuedBy.instituteDetails.branding);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkPopulate();
