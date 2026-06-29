const { Queue } = require('bullmq');
const Redis = require('ioredis');

const connection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      maxRetriesPerRequest: null,
    });

connection.on('error', (err) => {
  console.warn('[Redis] Connection error (BullMQ will retry):', err.message);
});

const issuanceQueue = new Queue('issuanceQueue', { connection });

async function enqueueIssuanceJob(jobData) {
  return await issuanceQueue.add('issueCredential', jobData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}

module.exports = {
  issuanceQueue,
  enqueueIssuanceJob,
  connection
};
