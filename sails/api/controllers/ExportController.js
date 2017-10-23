var pandoc = require('node-pandoc');

module.exports = {
  html: function (req, res) {
    let id = req.body.id || req.query.id || '';
    Versions.findOne({id:id}).then(function(thisVersion){
      let src = thisVersion.xml,
      args = '-f markdown -t html';
      callback = function (err, result) {
        if (err) console.error('Oh Nos: ',err);
        // Without the -o arg, the converted value will be returned.
        res.send(result);
      };
      pandoc(src, args, callback);
    })
  }
};
