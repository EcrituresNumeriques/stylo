const shell = require('shelljs')
const Article = require('./models/article')
const Version = require('./models/version')

const exportHTML = ({bib,yaml,md},res,req) => {

  //let args = '';
  //if(preview){args += '--standalone --template=templates/templateHtml5-preview.html5 -H templates/preview.html'}
  //else{args += '--standalone --template=templates/templateHtml5.html5'}
  //args += ' --verbose --standalone --section-divs --ascii --toc --csl=templates/chicagomodified.csl -f markdown -t html5 --filter pandoc-citeproc /'+version.id+'.yaml';
  //args += ' --ascii --filter pandoc-citeproc -f markdown -t html /'+version.id+'.yaml';
  //if(citation == "footnotes"){args += ' --csl templates/lettres-et-sciences-humaines-fr.csl'}
  //pandoc(src, args, (err, result)=>downloadHTML(err, result, version, res, preview));

  const pwd = shell.exec('pwd')
  shell.echo(md).to('src/data/md.md')
  const pandoc = shell.exec(`pandoc src/data/md.md --standalone --template=src/templates-stylo/templateHtml5.html5 --section-divs --ascii --toc --csl=src/templates-stylo/chicagomodified.csl -f markdown -t html5 -o src/data/html5.html`)
  shell.cd('src/data')
  const html5 = shell.cat('html5.html')




  res.send(`${html5}`)
}


const cat = shell.cat('/usr/src/app/src/export.js')


module.exports = {
  exportArticleHtml: async (req,res,next)=>{
    try{
      const article = await Article.findById(req.params.id)
      if(!article){
        throw new Error('Article Not found')
      }
      const versionID = article._doc.versions[article._doc.versions.length-1]
      const version = await Version.findById(versionID)
      if(!version){
        throw new Error('Version not found')
      }
      const cleanedVersion = version._doc

      exportHTML({bib:cleanedVersion.bib,yaml:cleanedVersion.yaml,md:cleanedVersion.md}, res, req)

    }
    catch(err){
      res.status(404).send(err)
    }
  },
  exportVersionHtml: (req,res,next)=>{
    res.send(`<p>Exporting Version ${req.params.id} to HTML</p>`)
  },
  exportArticleZip: (req,res,next)=>{
    res.send(`<p>Exporting Article ${req.params.id} to ZIP</p>`)
  },
  exportVersionZip: (req,res,next)=>{
    res.send(`<p>Exporting Version ${req.params.id} to ZIP</p>`)
  },
  exportBookHtml: (req,res,next)=>{
    res.send(`<p>Exporting Book ${req.params.id} to HTML</p>`)
  },
  exportBookZip: (req,res,next)=>{
    res.send(`<p>Exporting Book ${req.params.id} to ZIP</p>`)
  },
}