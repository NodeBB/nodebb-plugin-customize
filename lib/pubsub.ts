import { hostname } from 'os';
import { build as buildAssets } from './build';

const nconf = nodebb.require('nconf');
const winston = nodebb.require('winston');
const pubsub = nodebb.require('./src/pubsub');

const primary = nconf.get('isPrimary') === 'true' || nconf.get('isPrimary') === true;

export async function build(): Promise<void> {
  await buildAssets();

  pubsub.publish('customize:build', {
    hostname: hostname(),
  });
}

if (primary) {
  pubsub.on('customize:build', (data: { hostname: string }) => {
    if (data.hostname !== hostname()) {
      buildAssets().catch((err) => {
        winston.error(err);
      });
    }
  });
}
