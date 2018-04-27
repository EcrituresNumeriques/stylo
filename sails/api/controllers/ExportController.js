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
          const filename = thisVersion.title || thisVersion.version+'.'+thisVersion.revision;
          res.set('Content-Type', 'text/html');
          res.set('Content-Disposition', 'attachment; filename="'+filename+'"');
          res.send(new Buffer(result));
        }
      };
      pandoc(src, args, callback);
    })
  },

  htmlPreview: function (req, res) {
    Versions.findOne({id:req.params.version}).then(function(thisVersion){
      fs.writeFileSync('/'+thisVersion.id+'.md', thisVersion.md+'\n');
      let insertPos = thisVersion.yaml.lastIndexOf("\n---");
      fs.writeFileSync('/'+thisVersion.id+'.yaml', thisVersion.yaml.substring(0,insertPos)+'\nbibliography: /'+thisVersion.id+'.bib'+thisVersion.yaml.substring(insertPos));
      fs.writeFileSync('/'+thisVersion.id+'.bib', thisVersion.bib);
      let src = '/'+thisVersion.id+'.md',
      args = '--standalone --template=templateHtmlDcV2-preview.html5 --ascii --filter pandoc-citeproc -f markdown -t html /'+thisVersion.id+'.yaml';
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

  article: function (req, res) {
      Articles.findOne({id:req.params.id}).populate("versions",{limit: 1, sort: 'createdAt DESC'}).then(function(thisArticle){
          console.log(thisArticle);
      const thisVersion = thisArticle.versions[0];
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
          const filename = thisVersion.title || thisVersion.version+'.'+thisVersion.revision;
          res.set('Content-Type', 'text/html');
          res.set('Content-Disposition', 'attachment; filename="'+filename+'"');
          res.send(new Buffer(result));
        }
      };
      pandoc(src, args, callback);
    })
  },

  articlePreview: function (req, res) {
      Articles.findOne({id:req.params.id}).populate("versions",{limit: 1, sort: 'createdAt DESC'}).then(function(thisArticle){
                    console.log(thisArticle);
      const thisVersion = thisArticle.versions[0];
      fs.writeFileSync('/'+thisVersion.id+'.md', thisVersion.md+'\n');
      let insertPos = thisVersion.yaml.lastIndexOf("\n---");
      fs.writeFileSync('/'+thisVersion.id+'.yaml', thisVersion.yaml.substring(0,insertPos)+'\nbibliography: /'+thisVersion.id+'.bib'+thisVersion.yaml.substring(insertPos));
      fs.writeFileSync('/'+thisVersion.id+'.bib', thisVersion.bib);
      let src = '/'+thisVersion.id+'.md',
      args = '--standalone --template=templateHtmlDcV2-preview.html5 --ascii --filter pandoc-citeproc -f markdown -t html /'+thisVersion.id+'.yaml';
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
