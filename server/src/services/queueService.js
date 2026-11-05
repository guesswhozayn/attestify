const { Queue } = require('bullmq');
const Redis = require('ioredis');

const isServerlessWithoutQueue = Boolean(
  process.env.VERCEL && !process.env.USE_REDIS_QUEUE
);

function createRedisConnection() {
  if (isServerlessWithoutQueue) {
    return null;
  }

  const redisUrl = process.env.REDIS_URL || (process.env.REDIS_HOST?.startsWith('redis') ? process.env.REDIS_HOST : null);
  if (redisUrl) {
    return new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: redisUrl.startsWith('rediss://') ? {} : undefined
    });
  }

  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = Number(process.env.REDIS_PORT) || 6379;
  const password = process.env.REDIS_PASSWORD || undefined;

  return new Redis({
    host,
    port,
    password,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
}

const connection = createRedisConnection();

if (connection) {
  connection.on('error', (err) => {
    console.warn('[Redis] Connection error (BullMQ will retry):', err.message);
  });
}

const issuanceQueue = connection ? new Queue('issuanceQueue', { connection }) : null;

const enqueueIssuanceJob = (jobData) => {
  if (!issuanceQueue) {
    throw new Error('Redis queue is not active in serverless mode');
  }
  return issuanceQueue.add('issueCredential', jobData, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
};

const enqueueBulkIssuanceJobs = (jobsData) => {
  if (!issuanceQueue) {
    throw new Error('Redis queue is not active in serverless mode');
  }
  return issuanceQueue.addBulk(
    jobsData.map(job => ({
      name: 'issueCredential',
      data: job,
      opts: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      }
    }))
  );
};

module.exports = {
  issuanceQueue,
  enqueueIssuanceJob,
  enqueueBulkIssuanceJobs,
  connection,
  isServerlessWithoutQueue
};
