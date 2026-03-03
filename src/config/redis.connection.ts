const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: +(process.env.REDIS_PORT ?? 6379),
} as const;

export const bullmqConnectionOptions = { ...redisOptions };
