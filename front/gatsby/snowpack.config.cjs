const production = process.env.NODE_ENV === 'production'
const sourcemaps = process.env.ENABLE_SOURCEMAPS || production === false

module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  optimize: {
    bundle: false,
    minify: true,
    sourcemap: false,
    splitting: true,
    treeshake: true,
    target: "safari11.1"
  },
  routes: [
    {"match": "routes", "src": ".*", "dest": "/index.html"}
  ],
  plugins: [
    [
      '@snowpack/plugin-sass',
      {
         compilerOptions: {
           loadPath: ['node_modules']
         }
      }
    ],
    '@snowpack/plugin-react-refresh',
  ],
  devOptions: {
    port: 3000
  },
}
