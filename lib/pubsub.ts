import { hostname } from 'os';
import { build as buildAssets } from './build';

if (!require.main) { throw Error('[plugin-customize] `require.main` is undefined'); }
const nconf = require.main.require('nconf');
const winston = require.main.require('winston');
const pubsub = require.main.require('./src/pubsub');

const primary = nconf.get('isPrimary') === 'true' || nconf.get('isPrimary') === true;

export async function build(): Promise<void> {
  pubsub.publish('customize:build', {
    hostname: `${hostname()}:${nconf.get('port')}`,
  });

  if (primary) {
    await buildAssets();
  }
}

const logErrors = (err: Error): void => {
  if (err) {
    winston.error(err);
  }
};

if (primary) {
  pubsub.on('customize:build', (data: { hostname: string }) => {
    if (data.hostname !== `${hostname()}:${nconf.get('port')}`) {
      buildAssets().catch(logErrors);
    }
  });
}
