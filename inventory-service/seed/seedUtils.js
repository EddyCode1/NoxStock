export const shouldRunSeed = () =>
  process.env.SEED_DATA === 'true' ||
  (process.env.NODE_ENV !== 'production' && process.env.SEED_DATA !== 'false');
