// Initializes Sentry before any other module is loaded, so that its
// integrations can instrument them (express, mongoose, graphql...).
// Loaded with `node --require ./instrument.js app.js`.
const Sentry = require('@sentry/node')
const { nodeProfilingIntegration } = require('@sentry/profiling-node')
const pkg = require('./package.json')
const config = require('./config.js')

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
