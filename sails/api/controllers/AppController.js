module.exports = {
  index: function (req, res) {

    var bundle;

    if (sails.config.environment === 'production') {
      bundle = require('../../assets.json').main.js;
      console.log(bundle);
    }

    return res.view('index', {
      bundle: bundle,
    });
  },
};
