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
