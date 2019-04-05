const fs = require('fs');
var pandoc = require('node-pandoc');
var archiver = require('archiver');

const downloadHTML = function (err, result, version, res, preview=false) {
  if (err) {
    //console.log(err);
    fs.writeFileSync('/'+version.id+'.error', err.toString());
    res.attachment('/'+version.id+'.error');
    return false;
  }
  else{
    // Without the -o arg, the converted value will be returned.
    const filename = version.title || version.version+'.'+version.revision;
    res.set('Content-Type', 'text/html');
    if(!preview){res.set('Content-Disposition', 'attachment; filename="'+filename+'"');}
    res.send(new Buffer(result));
  }
};

const computeHTML = function(version,res,preview=false,citation=false){
  fs.writeFileSync('/'+version.id+'.md', version.md+'\n');
  let insertPos = version.yaml.lastIndexOf("\n---");
  fs.writeFileSync('/'+version.id+'.yaml', version.yaml.substring(0,insertPos)+'\nbibliography: /'+version.id+'.bib'+version.yaml.substring(insertPos));
  fs.writeFileSync('/'+version.id+'.bib', version.bib);
  let src = '/'+version.id+'.md';
  let args = '';
  if(preview){args += '--standalone --template=templates/templateHtmlDcV2-preview.html5'}
  else{args += '--standalone --template=templates/templateHtmlDcV2.html5'}
  args += ' --ascii --filter pandoc-citeproc -f markdown -t html /'+version.id+'.yaml';
  if(citation == "footnotes"){args += ' --csl templates/lettres-et-sciences-humaines-fr.csl'}
  pandoc(src, args, (err, result)=>downloadHTML(err, result, version, res, preview));
};

const ComputeZip = function(version,res,title=undefined){
  fs.writeFileSync('/'+version.id+'.md', version.md+'\n');
  let insertPos = version.yaml.lastIndexOf("\n---");
  fs.writeFileSync('/'+version.id+'.yaml', version.yaml.substring(0,insertPos)+'\nbibliography: /'+version.id+'.bib'+version.yaml.substring(insertPos));
  fs.writeFileSync('/'+version.id+'.bib', version.bib);

  var output = fs.createWriteStream('/'+version.id+'.zip');
  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  output.on('close', function() {
    //console.log('archive done');
    const filename = title || version.title || version.version+'.'+version.revision;
    //res.attachment('/'+thisVersion.id+'.yaml');
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename="'+filename+'.zip"');
    res.send(new Buffer(fs.readFileSync('/'+version.id+'.zip')));
  });

  archive.pipe(output);
  archive.file('/'+version.id+'.yaml',{name: version.id+'.yaml'});
  archive.file('/'+version.id+'.md',{name: version.id+'.md'});
  archive.file('/'+version.id+'.bib',{name: version.id+'.bib'});
  archive.finalize();
}


module.exports = {

  // Export for specific versions
  html: function (req, res) {
    Versions.findOne({id:req.params.version}).then(function(thisVersion){
      const preview = req.param('preview') == "true" ? true:false;
      const citation = req.param('citation',"inline");
      computeHTML(thisVersion,res,preview,citation);
    })
  },

  versionZIP: function (req, res) {
    Versions.findOne({id:req.params.version}).then(function(thisVersion){
      ComputeZip(thisVersion,res);
    })
  },


  //Export for last version of article


  article: function (req, res) {
      Articles.findOne({id:req.params.id}).populate("versions",{limit: 1, sort: 'createdAt DESC'}).then(function(thisArticle){
      const preview = req.param('preview') == "true" ? true:false;
      const citation = req.param('citation',"inline");
      computeHTML(thisArticle.versions[0],res,preview,citation);
    })
  },

  articleZIP: function (req, res) {
    Articles.findOne({id:req.params.id}).populate("versions",{limit: 1, sort: 'createdAt DESC'}).then(function(thisArticle){
    const filename = thisArticle.title || undefined;
    ComputeZip(thisArticle.versions[0],res,filename);
    })
  }
};
