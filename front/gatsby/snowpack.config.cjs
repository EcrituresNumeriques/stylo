const production = process.env.NODE_ENV === 'production'
const sourcemaps = process.env.ENABLE_SOURCEMAPS || production === false

module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  "optimize": {
    "bundle": true,
    "minify": production,
    "sourcemap": sourcemaps,
    "splitting": true,
    "treeshake": true,
  },
  routes: [
    {"match": "routes", "src": ".*", "dest": "/index.html"}
  ],
  plugins: [
    '@snowpack/plugin-sass',
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-babel',
    // [
    //   '@snowpack/plugin-webpack',
    //   {
    //     sourceMap: sourcemaps
    //   },
    // ]
  ],
  devOptions: {
    port: 3000,
  },
}
