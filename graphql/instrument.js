// Initializes Sentry before any other module is loaded, so that its
// integrations can instrument them (express, mongoose, graphql...).
// Loaded with `node --import ./instrument.js app.js`.
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import config from './config.js'
import pkg from './package.json' with { type: 'json' }

if (config.get('sentry.dsn')) {
  Sentry.init({
    dsn: config.get('sentry.dsn'),
    environment: config.get('env'),
    release: `stylo-graphql@${pkg.version}`,
    attachStacktrace: true,
    includeLocalVariables: true,
    integrations: [
      nodeProfilingIntegration(),
      Sentry.dedupeIntegration(),
      Sentry.mongooseIntegration(),
      Sentry.graphqlIntegration(),
      Sentry.dataloaderIntegration(),
      Sentry.consoleIntegration(),
      Sentry.extraErrorDataIntegration(),
      Sentry.onUncaughtExceptionIntegration(),
      Sentry.onUnhandledRejectionIntegration(),
      Sentry.linkedErrorsIntegration(),
      Sentry.rewriteFramesIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  })
}
