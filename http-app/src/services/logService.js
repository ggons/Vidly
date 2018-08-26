import Raven from 'raven-js';

function init() {
  Raven.config('https://6c7f0a2a2f9047a3a7336cd3506095b8@sentry.io/1268904').install();
}

function log(error) {
  Raven.captureException(error);
}

export default {
  init,
  log
}