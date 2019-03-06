const shell = require('shelljs')
const Article = require('./models/article')
const Version = require('./models/version')

const exportHTML = ({bib,yaml,md,id},res,req) => {

  let template = '../templates-stylo/templateHtml5.html5'
  if(req.query.preview){
    template='../templates-stylo/templateHtml5-preview.html5 -H ../templates-stylo/preview.html'
  }

  shell.cd('src/data')
  shell.exec(`rm ${id}*`)
  shell.echo(md).to(`${id}.md`)
  shell.echo(bib).to(`${id}.bib`)
  shell.echo(yaml).to(`${id}.yaml`)
  const pandoc = shell.exec(`pandoc ${id}.md ${id}.yaml --bibliography ${id}.bib --standalone --template=${template} --section-divs --ascii --toc --csl=../templates-stylo/chicagomodified.csl -f markdown -t html5 -o ${id}.html`).code
  const html5 = shell.cat(`${id}.html`)
  if(pandoc !== 0){
    res.status(403).send(`${html5}`)
  }
  res.send(`${html5}`)
}

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

      exportHTML({bib:cleanedVersion.bib,yaml:cleanedVersion.yaml,md:cleanedVersion.md, id:cleanedVersion._id}, res, req)

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