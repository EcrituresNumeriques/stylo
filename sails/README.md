# Sails + React + Webpack boilerplate

A boilerplate for [Sails](http://sailsjs.org) apps with a [React](https://facebook.github.io/react/) frontend.

## Includes

* [Sails](http://sailsjs.org)
* [React](https://facebook.github.io/react/)
* [Babel with ES2015](https://babeljs.io)
* [React Router](https://github.com/reactjs/react-router)
* [sails-hook-autoreload](https://github.com/sgress454/sails-hook-autoreload)
* [Sass](https://github.com/jtangelder/sass-loader)
* [Autoprefixer](https://github.com/passy/autoprefixer-loader)
* [React Hot Loader](https://github.com/gaearon/react-hot-loader)


___

### Clone

```shell
git clone https://github.com/markmur/sails-react-webpack.git
cd sails-react-webpack
npm install
```

___

### Run (development)

There are multiple ways to run the project in development as sails and webpack-dev-server run independently. The easiest way is to use [Foreman](https://github.com/theforeman/foreman) (`npm install -g foreman`) and run:

```shell
nf start
```

This will start all processes listed in the `Procfile`.

The alternative is to manually run each process in separate terminal windows.

To view your app, go to `http://localhost:3000` in your browser.
___

### Run (Production)

Wepack builds the bundle files on `postinstall` and sails is lifted the same way it's always lifted in production:

```shell
sails lift --prod
```

You can also manually run webpack with `npm run dist`.

___

### Generate Components

Use [react-component-gen](https://github.com/markmur/react-component-gen) to generate new components on the fly.
