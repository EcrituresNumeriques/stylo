# Stylo frontend

Frontend for the site hosted at https://stylo.ecrituresnumeriques.ca

## Prerequisite

You will need Node.js and npm on your machine.

Since port 80 cannot be bound (unless you are using root/sudo), you will probably need to edit the *package.json* file to use another port.
We recommend using port `3000`:

```diff
-"develop": "gatsby develop -p 80 -H 0.0.0.0",
+"develop": "gatsby develop -p 3000 -H 0.0.0.0",
```

```diff
-"serve": "gatsby serve -p 80 -H 0.0.0.0",
+"serve": "gatsby serve -p 3000 -H 0.0.0.0",
```

## Install

Install the dependencies using `npm`:

    $ npm i

## Develop

    $ npm run develop

## Deploy

    $ npm run serve
