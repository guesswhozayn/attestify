const { Worker } = require('bullmq');
const fs = require('fs');
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

    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser || !freshUser.isActive) {
      throw new Error('Issuer account is deactivated or no longer exists.');
    }
    if (freshUser.role !== 'ISSUER' || !freshUser.issuerDetails?.isVerified) {
      throw new Error('Issuer account lacks verified institutional credentials.');
    }

    const result = await credentialService.processIssuance(data, freshUser);
    console.log(`[Worker] Job ${job.id} completed successfully.`);
    return result;
  } catch (error) {
    const currentAttempt = job.attemptsMade + 1;
    console.error(`[Worker] Job ${job.id} (attempt ${currentAttempt}) failed:`, error.message);
    const maxAttempts = job.opts?.attempts || 3;
    const isFinalAttempt = currentAttempt >= maxAttempts;

    await prisma.credential.update({
      where: { id: data.credentialId },
      data: {
        status: isFinalAttempt ? 'FAILED' : 'PROCESSING',
        processingError: isFinalAttempt
          ? error.message
          : `Attempt ${currentAttempt}/${maxAttempts} failed: ${error.message}. Retrying...`
      }
    });
    throw error;
  }
}, { connection, concurrency: 1 });

issuanceWorker.on('failed', async (job, err) => {
  const maxAttempts = job?.opts?.attempts || 3;
  const attemptsMade = job?.attemptsMade || 0;
  if (attemptsMade < maxAttempts) {
    return;
  }

  console.error(`Job ${job?.id} permanently failed with error: ${err.message}`);
  const credentialId = job?.data?.data?.credentialId;
  if (credentialId) {
    try {
      await prisma.credential.update({
        where: { id: credentialId },
        data: { status: 'FAILED', processingError: err.message }
      });
    } catch (e) {
      console.warn('Failed to update credential status on permanent failure:', e.message);
    }
  }
});

module.exports = issuanceWorker;
