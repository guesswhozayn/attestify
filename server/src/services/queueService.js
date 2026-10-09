const { Queue } = require('bullmq');
const Redis = require('ioredis');

function createRedisConnection() {
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

connection.on('error', (err) => {
  console.warn('[Redis] Connection error (BullMQ will retry):', err.message);
});

const issuanceQueue = new Queue('issuanceQueue', { connection });

const enqueueIssuanceJob = (jobData) =>
  issuanceQueue.add('issueCredential', jobData, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });

module.exports = { issuanceQueue, enqueueIssuanceJob, connection };
