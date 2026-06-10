const Sentry = require('@sentry/node')
const { nodeProfilingIntegration } = require('@sentry/profiling-node')
const pkg = require('./package.json')
const process = require('node:process')
const debounce = require('lodash.debounce')
const config = require('./config.js')
const proxy = require('express-http-proxy')
const bodyParser = require('body-parser')
const git = require('isomorphic-git')
const {
  buildCorpusRepo,
  pktLine,
  FLUSH_PKT,
  sideBand,
  parseReceivePackRequest,
} = require('./helpers/git.js')
const { createMemFS } = require('./helpers/memfs.js')

config.validate({ allowed: 'strict' })

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

process.env.YPERSISTENCE = config.get(
  'collaboration.editingSessionDataDirectory'
)

const express = require('express')
const { createHandler } = require('graphql-http/lib/use/express')
const mongoose = require('mongoose')
const cors = require('cors')

const session = require('express-session')
const { MongoStore } = require('connect-mongo')
const passport = require('passport')
const { logger } = require('./logger')
const pino = require('pino-http')({
  logger,
})

const schema = require('./schema')

const { populateUserFromJWT } = require('./helpers/token.js')

const User = require('./models/user')
const {
  stampAuth,
  onAuthSuccess,
  onAuthFailure,
  localAuth,
  humanidAuth,
  hypothesisAuth,
  zoteroAuth,
} = require('./auth/index.js')

const { createLoaders } = require('./loaders.js')

const Y = require('yjs')
const yjsUtils = require('@y/websocket-server/utils')
const WebSocket = require('ws')
const { handleEvents } = require('./events')
const { requestHandler: backupRequestHandler } = require('./backup')
const fs = require('node:fs')
const yaml = require('js-yaml')
const wss = new WebSocket.Server({ noServer: true })

const jwtSecret = config.get('security.jwt.secret')

//A Secure cookie is only sent to the server with an encrypted request over the HTTPS protocol.
// Note that insecure sites (http:) can't set cookies with the Secure directive.
const secureCookie = config.get('securedCookie')
// When we have multiple origins (for instance, using deploy previews on different domains) then cookies `sameSite` attribute is permissive (using 'none' value).
// When we have a single origin (most likely when running in a production environment) then we are using a secure/strict value for cookies `sameSite` attribute ('strict').
// When using 'strict' value, cookies will not be sent along with requests initiated by third-party websites.
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
const allowedOrigins = config.get('security.cors.origin')

// SameSite should be None on cross-site response.
// Please note that "SameSite=None" must also specify the Secure attribute (they require a secure context/HTTPS).
/**
 * @type {boolean | 'lax' | 'strict' | 'none'}
 */
const sameSiteCookies =
  allowedOrigins.length > 1 && secureCookie ? 'none' : 'lax'

/**
 * @type {import('cors').CorsOptions}
 */
const corsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  // Access-Control-Allow-Origin header will be added only if the inbound Origin header matches one of the allowed origins
  origin(origin, callback) {
    const found = allowedOrigins.some((o) => o.test(origin))
    callback(null, found ? origin : false)
  },
}

/*
 * Setup database
 */
const mongooseP = mongoose
  .connect(config.get('mongo.databaseUrl'))
  .then((m) => m.connection.getClient())

/*
 * Setup App
 */
const app = express()

config.get('sentry.dsn') && Sentry.setupExpressErrorHandler(app)

/**
 * @type {import('express-session').SessionOptions}
 */
const sessionOptions = {
  name: 'stylo.session',
  secret: config.get('security.session.secret'),
  resave: false,
  proxy: true,
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise: mongooseP,
    autoRemove: 'native',
    touchAfter: 12 * 3600,
  }),
  cookie: {
    httpOnly: true,
    secure: secureCookie,
    sameSite: sameSiteCookies,
  },
}

passport.use('zotero', zoteroAuth.strategy)
passport.use('humanid', humanidAuth.strategy)
passport.use('hypothesis', hypothesisAuth.strategy)
passport.use(localAuth.strategy)

// mandatory for passport-login/logout
passport.serializeUser((user, next) => next(null, user.id))
passport.deserializeUser(async (id, next) => {
  const user = await User.findById(id)
  next(null, user)
})

app.set('trust proxy', true)
app.set('x-powered-by', false)
app.use(pino)
app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))
app.use(session(sessionOptions))

app.use(passport.session(sessionOptions))

app.get('/version', (req, res) =>
  res.json({
    name: pkg.name,
    version: pkg.version,
  })
)

app.get('/events', handleEvents)

config.get('auth.enabledServices').forEach((service) => {
  // used on initial login
  app.get(
    `/login/${service}`,
    stampAuth(service),
    passport.authenticate(service)
  )

  // used to link account when we are already logged in
  app.get(
    `/authorize/${service}`,
    stampAuth(service, { alreadyLoggedIn: true }),
    passport.authorize(service)
  )
})

app.post(
  '/login/local',
  passport.authenticate('local'),
  localAuth.onSuccess,
  localAuth.onFailure
)

app.use(
  '/authorization-code/hypothesis/callback',
  passport.authorize('hypothesis'),
  onAuthSuccess,
  onAuthFailure
)

app.use(
  '/authorization-code/zotero/callback',
  passport.authorize('zotero'),
  onAuthSuccess,
  onAuthFailure
)

app.use(
  '/authorization-code/callback',
  passport.authorize('humanid'),
  onAuthSuccess,
  onAuthFailure
)

/*
 * Feed proxy
 */
app.use(
  '/community/alerts.json',
  proxy('https://discussions.revue30.org', {
    parseReqBody: false,
    proxyReqPathResolver() {
      // we filter on pinned alert, latest topic first
      return '/search.json?q=tags:alerte&amp;in:pinned&amp;order:latest_topic'
    },
  })
)
app.use(
  '/feed/publications',
  proxy('https://revue30.org', {
    parseReqBody: false,
    proxyReqPathResolver() {
      return '/blog/feed.xml'
    },
  })
)
app.use(
  '/feed/releases',
  proxy('https://github.com', {
    parseReqBody: false,
    proxyReqPathResolver() {
      return '/ecrituresNumeriques/stylo/releases.atom'
    },
  })
)

/* Nakala */
app.use('/nakala', proxy(config.get('nakala.apiUrl')))

/* Backup */
app.post(
  '/backup',
  populateUserFromJWT({ jwtSecret }),
  bodyParser.json(),
  backupRequestHandler
)

app.get('/git/corpus/:corpusId.git/info/refs', async (req, res) => {
  const corpusId = req.params.corpusId
  const { service } = req.query

  const dir = '/'
  const gitdir = '/corpus/.git'
  const fs = createMemFS()
  const { commitOid } = await buildCorpusRepo({
    fs,
    dir,
    gitdir,
    corpusId,
  })

  console.log({ service })
  if (service === 'git-receive-pack') {
    // report-status / report-status-v2 sont indispensables : sans eux le client
    // active le démultiplexeur side-band mais n'attend aucun rapport, et part en
    // « error in sideband demultiplexer » quand on lui envoie le report sur le canal 1.
    const caps =
      'report-status report-status-v2 delete-refs side-band-64k ofs-delta agent=stylo/1.0'
    res.set('Content-Type', 'application/x-git-receive-pack-advertisement')
    res.set('Cache-Control', 'no-cache')
    res.set('Git-Protocol', 'version=2')
    res.write(pktLine('# service=git-receive-pack\n'))
    res.write(FLUSH_PKT)
    res.write(pktLine(`${commitOid} HEAD\0${caps}\n`))
    res.write(pktLine(`${commitOid} refs/heads/main\n`))
    res.write(FLUSH_PKT)
    res.end()
    console.log('2')
    return
  }
  if (service === 'git-upload-pack') {
    try {
      const caps = 'symref=HEAD:refs/heads/main agent=stylo/1.0'
      res.set('Content-Type', 'application/x-git-upload-pack-advertisement')
      res.set('Cache-Control', 'no-cache')
      res.set('Git-Protocol', 'version=2')
      res.write(pktLine('# service=git-upload-pack\n'))
      res.write(FLUSH_PKT)
      res.write(pktLine(`${commitOid} HEAD\0${caps}\n`))
      res.write(pktLine(`${commitOid} refs/heads/main\n`))
      res.write(FLUSH_PKT)
      res.end()
    } catch (err) {
      res.status(err.status || 500).send(err.message)
    }
    return
  }

  res.status(403).send('Unsupported service')
})

app.get('/git/corpus/:corpusId.git/HEAD', async (req, res) => {})

app.post(
  '/git/corpus/:corpusId.git/git-receive-pack',
  // Le corps contient un packfile binaire : il faut le récupérer en Buffer brut.
  // `bodyParser.text` le décoderait en UTF-8 et corromprait les objets.
  bodyParser.raw({
    type: 'application/x-git-receive-pack-request',
    limit: '50mb',
  }),
  async (req, res) => {
    const corpusId = req.params.corpusId
    const { commands, capabilities } = parseReceivePackRequest(req.body)

    // Tout git moderne annonce side-band-64k pour receive-pack ; on ne peut
    // afficher des messages « remote: » que dans ce cas.
    const useSideBand =
      capabilities.includes('side-band-64k') ||
      capabilities.includes('side-band')

    res.set('Content-Type', 'application/x-git-receive-pack-result')
    res.set('Cache-Control', 'no-cache')

    // TODO: désérialiser le packfile (req.body après la liste des refs) et
    // persister réellement les objets. Pour l'instant on accepte tel quel.

    // report-status : un bloc PKT-LINE (unpack + statut par ref) terminé par un flush.
    const report = [pktLine('unpack ok\n')]
    console.log({ commands })
    for (const { ref } of commands) {
      report.push(pktLine(`ok ${ref}\n`))
    }
    report.push(FLUSH_PKT)
    const reportStatus = Buffer.concat(report)

    if (useSideBand) {
      const corpusUrl = `${config.get('frontend.baseUrl')}/corpus/${corpusId}`
      for (const message of [
        '\n',
        'Stylo does not support pushing changes over Git.\n',
        'Please edit your corpus from the web interface instead:\n',
        `  ${corpusUrl}\n`,
        '\n',
      ]) {
        res.write(sideBand(2, message))
      }

      // Le report-status passe par le canal 1, puis un flush termine le flux multiplexé.
      res.write(sideBand(1, reportStatus))

      res.write(FLUSH_PKT)
    } else {
      // Pas de side-band : on ne peut envoyer que le report-status brut.
      res.write(reportStatus)
    }

    res.end()
  }
)

app.post(
  '/git/corpus/:corpusId.git/git-upload-pack',
  bodyParser.text({ type: 'application/x-git-upload-pack-request' }),
  async (req, res) => {
    const corpusId = req.params.corpusId

    try {
      const dir = '/'
      const gitdir = '/corpus/.git'
      const fs = createMemFS()
      const { allOids } = await buildCorpusRepo({
        fs,
        dir,
        gitdir,
        corpusId,
      })

      const { packfile } = await git.packObjects({
        fs,
        dir,
        gitdir,
        write: false,
        oids: [...allOids],
      })

      res.set('Content-Type', 'application/x-git-upload-pack-result')
      res.set('Cache-Control', 'no-cache')
      res.write(pktLine('NAK\n'))
      res.write(Buffer.from(packfile))
      res.end()
    } catch (err) {
      res.status(err.status || 500).send(err.message)
    }
  }
)

/*
 * GraphQL interface
 */

app.post(
  '/graphql',
  populateUserFromJWT({ jwtSecret }),
  createHandler({
    schema,
    /**
     * @param {express.Request} req
     * @returns {import('./token.js').RequestContext}
     */
    context(req) {
      const token = req.raw.token ?? {}
      const user = req.raw.user ?? null
      return {
        loaders: createLoaders(),
        session: req.raw.session,
        token,
        user,
        userId: user?.id.toString() || token?._id,
      }
    },
  })
)

// Collaborative Writing Websocket
const builtinPersistence = yjsUtils.getPersistence()
yjsUtils.setPersistence({
  bindState: async (roomName, ydoc) => {
    if (roomName) {
      const articleId = roomName.split('/')[1] // format: ws/{articleId}
      const result = await mongoose.connection.collection('articles').findOne({
        $and: [
          { _id: new mongoose.Types.ObjectId(articleId) },
          { 'workingVersion.ydoc': { $ne: null } },
        ],
      })
      if (result) {
        try {
          const documentState = Buffer.from(
            result.workingVersion.ydoc,
            'base64'
          )
          Y.applyUpdate(ydoc, documentState)
        } catch (error) {
          Sentry.captureException(error)
          console.error(
            `Unable to load document state from the working copy on article: ${articleId}`,
            error
          )
        }
      }
      try {
        // noinspection ES6RedundantAwait — le type est déclaré void mais l'implémentation LevelDB (initialisée quand YPERSISTENCE est configuré) est bien async
        await builtinPersistence.bindState(roomName, ydoc)
      } catch (error) {
        Sentry.captureException(error)
        console.error(
          `Unable to bind persistence state for article: ${articleId}`,
          error
        )
      }
      ydoc.on(
        'update',
        debounce(
          async () => {
            const articleId = roomName.split('/')[1] // format: ws/{articleId}
            try {
              const documentState = Y.encodeStateAsUpdate(ydoc) // is a Uint8Array
              await mongoose.connection.collection('articles').updateOne(
                { _id: new mongoose.Types.ObjectId(articleId) },
                {
                  $set: {
                    'workingVersion.ydoc':
                      Buffer.from(documentState).toString('base64'),
                    updatedAt: new Date(),
                  },
                }
              )
            } catch (error) {
              Sentry.captureException(error)
              console.error(
                `Unable to save document state to the working copy on article: ${articleId}`,
                error
              )
            }
          },
          config.get('collaboration.updateWorkingCopyIntervalMs'),
          { leading: false, trailing: true }
        )
      )
    }
  },
  writeState: async (roomName, ydoc) => {
    if (roomName) {
      try {
        await builtinPersistence.writeState(roomName, ydoc)
      } catch (error) {
        Sentry.captureException(error)
        console.error(
          `Unable to write persistence state for room: ${roomName}`,
          error
        )
      }
    }
  },
})
wss.on('connection', yjsUtils.setupWSConnection)

const server = app.listen(config.get('port'), (err) => {
  if (err) {
    logger.error({ err }, 'Unable to connect to MongoDB.')
    throw err
  }

  logger.info('Listening on http://localhost:%s', config.get('port'))
})

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, function handleAuth(ws) {
    // const jwtToken = new URL('http://localhost' + request.url).searchParams.get("token")
    // TODO: check token and permissions
    wss.emit('connection', ws, request)
  })
})
