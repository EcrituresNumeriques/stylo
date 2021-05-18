const production = process.env.NODE_ENV === 'production'
const sourcemaps = process.env.ENABLE_SOURCEMAPS || production === false

module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  optimize: {
    bundle: true,
    minify: false,
    sourcemap: false,
    splitting: true,
    treeshake: true,
    target: "safari11"
  },
  routes: [
    {"match": "routes", "src": ".*", "dest": "/index.html"}
  ],
  plugins: [
    '@snowpack/plugin-sass',
    '@snowpack/plugin-react-refresh',
  ],
  devOptions: {
    port: 3000
  },
}
