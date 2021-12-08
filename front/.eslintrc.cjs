module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "jest/globals": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 13,
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "jest"
    ],
    "settings": {
      "react": {
        "version": "16.13"
      }
    },
    "rules": {
      'react/prop-types': ['warn'],
      'no-unused-vars': ['warn']
    }
};
