const fs = require('fs');
var pandoc = require('node-pandoc');
var archiver = require('archiver');

const computeHTML = function(version,callback,preview=false,footnotes=false){
  fs.writeFileSync('/'+version.id+'.md', version.md+'\n');
  let insertPos = version.yaml.lastIndexOf("\n---");
  fs.writeFileSync('/'+version.id+'.yaml', version.yaml.substring(0,insertPos)+'\nbibliography: /'+version.id+'.bib'+version.yaml.substring(insertPos));
  fs.writeFileSync('/'+version.id+'.bib', version.bib);
  let src = '/'+version.id+'.md';
  let args = '';
  if(preview){args += '--standalone --template=templates/templateHtmlDcV2-preview.html5'}
  else{args += '--standalone --template=templates/templateHtmlDcV2.html5'}
  args += ' --ascii --filter pandoc-citeproc -f markdown -t html /'+version.id+'.yaml';
  if(footnotes){args += ' --csl templates/lettres-et-sciences-humaines-fr.csl'}
  pandoc(src, args, callback);
};
const downloadHTML = function (err, result) {
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


module.exports = {

  // Export for specific versions

  html: function (req, res) {
    Versions.findOne({id:req.params.version}).then(function(thisVersion){
      computeHTML(thisVersion,downloadHTML);
    })
  },

  htmlPreview: function (req, res) {
    Versions.findOne({id:req.params.version}).then(function(thisVersion){
      fs.writeFileSync('/'+thisVersion.id+'.md', thisVersion.md+'\n');
      let insertPos = thisVersion.yaml.lastIndexOf("\n---");
      fs.writeFileSync('/'+thisVersion.id+'.yaml', thisVersion.yaml.substring(0,insertPos)+'\nbibliography: /'+thisVersion.id+'.bib'+thisVersion.yaml.substring(insertPos));
      fs.writeFileSync('/'+thisVersion.id+'.bib', thisVersion.bib);
      let src = '/'+thisVersion.id+'.md',
      args = '--standalone --template=templates/templateHtmlDcV2-preview.html5 --ascii --filter pandoc-citeproc -f markdown -t html /'+thisVersion.id+'.yaml';
      //args = '-f markdown -t html --template=templates/templateHtmlDcV0.html5 --filter pandoc-citeproc --ascii /'+thisVersion.id+'.yaml';
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

  versionZIP: function (req, res) {
    Versions.findOne({id:req.params.version}).then(function(thisVersion){
      fs.writeFileSync('/'+thisVersion.id+'.md', thisVersion.md+'\n');
      let insertPos = thisVersion.yaml.lastIndexOf("\n---");
      fs.writeFileSync('/'+thisVersion.id+'.yaml', thisVersion.yaml.substring(0,insertPos)+'\nbibliography: /'+thisVersion.id+'.bib'+thisVersion.yaml.substring(insertPos));
      fs.writeFileSync('/'+thisVersion.id+'.bib', thisVersion.bib);
      let src = '/'+thisVersion.id+'.md',
      args = '--standalone --template=templates/templateHtmlDcV2.html5 --ascii --filter pandoc-citeproc -f markdown -t html /'+thisVersion.id+'.yaml';
      //args = '-f markdown -t html --template=templates/templateHtmlDcV0.html5 --filter pandoc-citeproc --ascii /'+thisVersion.id+'.yaml';
      callback = function (err, result) {
        if (err) {
          console.log(err);
          fs.writeFileSync('/'+thisVersion.id+'.error', err.toString());
          res.attachment('/'+thisVersion.id+'.error');
          return false;
        }
        else{

          var output = fs.createWriteStream('/'+thisVersion.id+'.zip');
          var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
          });

          output.on('close', function() {
            console.log('archive done');
            const filename = thisVersion.title || thisVersion.version+'.'+thisVersion.revision;
            //res.attachment('/'+thisVersion.id+'.yaml');
            res.set('Content-Type', 'application/zip');
            res.set('Content-Disposition', 'attachment; filename="'+filename+'.zip"');
            res.send(new Buffer(fs.readFileSync('/'+thisVersion.id+'.zip')));
          });

          archive.pipe(output);
          archive.file('/'+thisVersion.id+'.yaml',{name: thisVersion.id+'.yaml'});
          archive.file('/'+thisVersion.id+'.md',{name: thisVersion.id+'.md'});
          archive.file('/'+thisVersion.id+'.bib',{name: thisVersion.id+'.bib'});
          archive.append(result, {name:thisVersion.id+'.html'});
          archive.finalize();



          // Without the -o arg, the converted value will be returned.

        }
      };
      pandoc(src, args, callback);
    })
  },


  //Export for last version of article


  article: function (req, res) {
      Articles.findOne({id:req.params.id}).populate("versions",{limit: 1, sort: 'createdAt DESC'}).then(function(thisArticle){
          console.log(thisArticle);
      const thisVersion = thisArticle.versions[0];
      fs.writeFileSync('/'+thisVersion.id+'.md', thisVersion.md+'\n');
      let insertPos = thisVersion.yaml.lastIndexOf("\n---");
      fs.writeFileSync('/'+thisVersion.id+'.yaml', thisVersion.yaml.substring(0,insertPos)+'\nbibliography: /'+thisVersion.id+'.bib'+thisVersion.yaml.substring(insertPos));
      fs.writeFileSync('/'+thisVersion.id+'.bib', thisVersion.bib);
      let src = '/'+thisVersion.id+'.md',
      args = '--standalone --template=templates/templateHtmlDcV2.html5 --ascii --filter pandoc-citeproc -f markdown -t html /'+thisVersion.id+'.yaml';
      //args = '-f markdown -t html --template=templates/templateHtmlDcV0.html5 --filter pandoc-citeproc --ascii /'+thisVersion.id+'.yaml';
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

  articleZIP: function (req, res) {
    Articles.findOne({id:req.params.id}).populate("versions",{limit: 1, sort: 'createdAt DESC'}).then(function(thisArticle){
        console.log(thisArticle);
    const thisVersion = thisArticle.versions[0];
    const filename = thisArticle.title || thisVersion.title || thisVersion.version+'.'+thisVersion.revision;
    fs.writeFileSync('/'+thisVersion.id+'.md', thisVersion.md+'\n');
    let insertPos = thisVersion.yaml.lastIndexOf("\n---");
    fs.writeFileSync('/'+thisVersion.id+'.yaml', thisVersion.yaml.substring(0,insertPos)+'\nbibliography: /'+thisVersion.id+'.bib'+thisVersion.yaml.substring(insertPos));
    fs.writeFileSync('/'+thisVersion.id+'.bib', thisVersion.bib);
    let src = '/'+thisVersion.id+'.md',
    args = '--standalone --template=templates/templateHtmlDcV2.html5 --ascii --filter pandoc-citeproc -f markdown -t html /'+thisVersion.id+'.yaml';
    //args = '-f markdown -t html --template=templates/templateHtmlDcV0.html5 --filter pandoc-citeproc --ascii /'+thisVersion.id+'.yaml';
    callback = function (err, result) {
      if (err) {
        console.log(err);
        fs.writeFileSync('/'+thisVersion.id+'.error', err.toString());
        res.attachment('/'+thisVersion.id+'.error');
        return false;
      }
      else{

        var output = fs.createWriteStream('/'+thisVersion.id+'.zip');
        var archive = archiver('zip', {
          zlib: { level: 9 } // Sets the compression level.
        });

        output.on('close', function() {
          console.log('archive done');

          //res.attachment('/'+thisVersion.id+'.yaml');
          res.set('Content-Type', 'application/zip');
          res.set('Content-Disposition', 'attachment; filename="'+filename+'.zip"');
          res.send(new Buffer(fs.readFileSync('/'+thisVersion.id+'.zip')));
        });

        archive.pipe(output);
        archive.file('/'+thisVersion.id+'.yaml',{name: thisVersion.id+'.yaml'});
        archive.file('/'+thisVersion.id+'.md',{name: thisVersion.id+'.md'});
        archive.file('/'+thisVersion.id+'.bib',{name: thisVersion.id+'.bib'});
        archive.append(result, {name:filename+'.html'});
        archive.finalize();
        // Without the -o arg, the converted value will be returned.

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
      args = '--standalone --template=templates/templateHtmlDcV2-preview.html5 --ascii --filter pandoc-citeproc -f markdown -t html /'+thisVersion.id+'.yaml';
      //args = '-f markdown -t html --template=templates/templateHtmlDcV0.html5 --filter pandoc-citeproc --ascii /'+thisVersion.id+'.yaml';
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
