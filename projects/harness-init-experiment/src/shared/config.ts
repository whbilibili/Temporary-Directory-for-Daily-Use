export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  scheduler: {
    concurrency: parseInt(process.env.SCHEDULER_CONCURRENCY || '5', 10),
    pollInterval: parseInt(process.env.POLL_INTERVAL || '1000', 10),
  },
};
