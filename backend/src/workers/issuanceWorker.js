const { Worker } = require('bullmq');
const { connection } = require('../services/queueService');
const credentialIssuanceService = require('../services/credentialIssuanceService');
const Credential = require('../models/Credential');

const issuanceWorker = new Worker('issuanceQueue', async (job) => {
  console.log(`[Worker] Processing job ${job.id} for credential ${job.data.data.credentialId}`);
  
  const { data, user } = job.data;

  try {
    await Credential.findByIdAndUpdate(data.credentialId, { status: 'PROCESSING', jobId: job.id });

    // Handle serialized Buffer objects
    if (data.studentImageBuffer && data.studentImageBuffer.type === 'Buffer') {
      data.studentImageBuffer = Buffer.from(data.studentImageBuffer.data);
    }

    const result = await credentialIssuanceService.processIssuance(data, user);

    console.log(`[Worker] Job ${job.id} completed successfully.`);
    return result;

  } catch (error) {
    console.error(`[Worker] Job ${job.id} failed:`, error.message);
    
    await Credential.findByIdAndUpdate(data.credentialId, { 
      status: 'FAILED',
      processingError: error.message
    });
    
    throw error;
  }
}, { connection, concurrency: 1 }); // concurrency 1 prevents nonce collisions for blockchain txs

issuanceWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} permanently failed with error: ${err.message}`);
});

module.exports = issuanceWorker;
