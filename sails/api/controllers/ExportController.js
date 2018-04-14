const fs = require('fs');
var pandoc = require('node-pandoc');

module.exports = {
  html: function (req, res) {
    Versions.findOne({id:req.params.version}).then(function(thisVersion){
      fs.writeFileSync('/'+thisVersion.id+'.md', thisVersion.md+'\n');
      let insertPos = thisVersion.yaml.lastIndexOf("\n---");
      fs.writeFileSync('/'+thisVersion.id+'.yaml', thisVersion.yaml.substring(0,insertPos)+'\nbibliography: /'+thisVersion.id+'.bib'+thisVersion.yaml.substring(insertPos));
      fs.writeFileSync('/'+thisVersion.id+'.bib', thisVersion.bib);
      let src = '/'+thisVersion.id+'.md',
      args = '--standalone --template=templateHtmlDcV2.html5 --ascii --filter pandoc-citeproc -f markdown -t html /'+thisVersion.id+'.yaml';
      //args = '-f markdown -t html --template=templateHtmlDcV0.html5 --filter pandoc-citeproc --ascii /'+thisVersion.id+'.yaml';
      callback = function (err, result) {
        if (err) {
          console.log(err);
          fs.writeFileSync('/'+thisVersion.id+'.error', err.toString());
          res.attachment('/'+thisVersion.id+'.error');
          return false;
        }
        else{
          // Without the -o arg, the converted value will be returned.
          res.set('Content-Type', 'text/html');
          res.send(new Buffer(result));
        }
      };
      pandoc(src, args, callback);
    })
  },
  erudit: function (req, res) {
    res.send('Not yet implemented');
  }
};
