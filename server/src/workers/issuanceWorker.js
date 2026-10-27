const { Worker } = require('bullmq');
const { connection } = require('../services/queueService');
const credentialService = require('../services/credentialService');
const { prisma } = require('../config/database');

const issuanceWorker = new Worker('issuanceQueue', async (job) => {
  console.log(`[Worker] Processing job ${job.id} for credential ${job.data.data.credentialId}`);
  const { data, user } = job.data;

  try {
    await prisma.credential.update({
      where: { id: data.credentialId },
      data: { status: 'PROCESSING', jobId: job.id }
    });

    if (data.studentImageBuffer?.type === 'Buffer') {
      data.studentImageBuffer = Buffer.from(data.studentImageBuffer.data);
    }

    const result = await credentialService.processIssuance(data, user);
    console.log(`[Worker] Job ${job.id} completed successfully.`);
    return result;
  } catch (error) {
    console.error(`[Worker] Job ${job.id} failed:`, error.message);
    await prisma.credential.update({
      where: { id: data.credentialId },
      data: {
        status: 'FAILED',
        processingError: error.message
      }
    });
    throw error;
  }
}, { connection, concurrency: 1 });

issuanceWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} permanently failed with error: ${err.message}`);
});

module.exports = issuanceWorker;
