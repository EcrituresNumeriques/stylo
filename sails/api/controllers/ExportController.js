var pandoc = require('node-pandoc');

module.exports = {
  html: function (req, res) {
    Versions.findOne({id:req.params.version}).then(function(thisVersion){
      let src = thisVersion.md,
      args = ['-f','markdown','-t','html','--template=templateHtmlDcV0.html5'];
      callback = function (err, result) {
        if (err) console.error('Oh Nos: ',err);
        // Without the -o arg, the converted value will be returned.
        res.set('Content-Type', 'text/html');
        res.send(new Buffer(result));
      };
      pandoc(src, args, callback);
    })
  }
};
