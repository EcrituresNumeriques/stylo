const production = process.env.NODE_ENV === 'production'
const sourcemaps = !production || process.env.ENABLE_SOURCEMAPS

module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  "optimize": {
    "bundle": true,
    "minify": production,
    "sourcemaps": sourcemaps,
    "splitting": true,
    "treeshake": true
  },
  routes: [
    {"match": "routes", "src": ".*", "dest": "/index.html"}
  ],
  plugins: [
    '@snowpack/plugin-sass',
    '@snowpack/plugin-react-refresh'
  ],
  devOptions: {
    port: 3000,
  },
}
