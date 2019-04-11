const shell = require('shelljs')
const Article = require('./models/article')
const Version = require('./models/version')
const Tag = require('./models/tag')

const filterAlphaNum = (string) => {
  return string.replace(/\s/g,"_").replace(/[ÉéÈèÊêËë]/g,"e").replace(/[ÔôÖö]/g,"o").replace(/[ÂâÄäÀà]/g,"a").replace(/[Çç]/g,"c").replace(/[^A-Za-z0-9_]/g,"")  
}

const exportHTML = ({bib,yaml,md,id,title},res,req) => {

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
  if(pandoc !== 0){
    const html5 = shell.cat(`${id}.html`)
    return res.status(500).send(`${html5}`)
  }
  if(!req.query.preview){
    res.set('Content-Disposition', `attachment; filename="${filterAlphaNum(title)}.html"`)
  }
  const html5 = shell.cat(`${id}.html`)
  return res.send(`${html5}`)
}

const exportZIP = ({bib,yaml,md,id,title},res,req) => {
  shell.cd('src/data')
  shell.exec(`rm ${id}*`)
  shell.echo(md).to(`${id}.md`)
  shell.echo(bib).to(`${id}.bib`)
  shell.echo(yaml).to(`${id}.yaml`)
  shell.sed('-i', /^.*bibliography.*$/, '', `${id}.yaml`)
  shell.exec(`sed -i '$ d' ${id}.yaml`)
  shell.echo(`bibliography: ${id}.bib\n---`).toEnd(`${id}.yaml`)
  shell.exec(`zip ${title}.zip ${id}.*`)
  res.set('Content-Disposition', `attachment; filename="${title}.zip"`)
  return res.download(`${process.env.PWD}/src/data/${title}.zip`)
}

const alphaSort = (a, b) => {
  if(a.title < b.title) { return -1; }
  if(a.title > b.title) { return 1; }
  return 0;
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

      exportHTML({bib:cleanedVersion.bib,yaml:cleanedVersion.yaml,md:cleanedVersion.md, id:cleanedVersion._id, title:article._doc.title}, res, req)

    }
    catch(err){
      res.status(404).send(err)
    }
  },
  exportVersionHtml: async (req,res,next)=>{
    try{
     const version = await Version.findById(req.params.id)
      if(!version){
        throw new Error('Version not found')
      }
      const cleanedVersion = version._doc

      exportHTML({bib:cleanedVersion.bib,yaml:cleanedVersion.yaml,md:cleanedVersion.md, id:cleanedVersion._id, title:cleanedVersion._id}, res, req)

    }
    catch(err){
      res.status(404).send(err)
    } 
  
  },
  exportVersionZip: async (req,res,next)=>{
    try{
      const version = await Version.findById(req.params.id)
       if(!version){
         throw new Error('Version not found')
       }
       const cleanedVersion = version._doc
 
       exportZIP({bib:cleanedVersion.bib,yaml:cleanedVersion.yaml,md:cleanedVersion.md, id:cleanedVersion._id, title:cleanedVersion._id}, res, req)
 
     }
     catch(err){
       res.status(404).send(err)
     } 
  },
  exportBookHtml: async (req,res,next)=>{
    try{
      const book = await Tag.findById(req.params.id)
       if(!book){
         throw new Error('Book not found')
       }
       const cleanedBook = book._doc
 
       //Get the mashed md of all last version of all chapters
       const chapters = await Article.find({_id:{$in: cleanedBook.articles}}).populate('versions')

       // ordonate chapters by alphabet ASC
       const mds = chapters.sort(alphaSort).map(c=>c.versions[c.versions.length-1].md)

       const bibs = chapters.sort(alphaSort).map(c=>c.versions[c.versions.length-1].bib)

       const firstChapter = chapters.sort(alphaSort)[0]
       const yaml = firstChapter.versions[firstChapter.versions.length-1].yaml

       exportHTML({bib:[cleanedBook.bib, ...bibs].join('\n'),yaml:yaml,md:mds.join('\n\n'), id:cleanedBook._id, title:cleanedBook.name}, res, req)
 
     }
     catch(err){
       res.status(404).send(err)
     } 
  },
  exportBookZip: async (req,res,next)=>{
    try{
      const book = await Tag.findById(req.params.id)
       if(!book){
         throw new Error('Book not found')
       }
       const cleanedBook = book._doc
 
       //Get the mashed md of all last version of all chapters
       const chapters = await Article.find({_id:{$in: cleanedBook.articles}}).populate('versions')

       // ordonate chapters by alphabet ASC
       const mds = chapters.sort(alphaSort).map(c=>c.versions[c.versions.length-1].md)

       const bibs = chapters.sort(alphaSort).map(c=>c.versions[c.versions.length-1].bib)

       const firstChapter = chapters.sort(alphaSort)[0]
       const yaml = firstChapter.versions[firstChapter.versions.length-1].yaml

       exportZIP({bib:[cleanedBook.bib, ...bibs].join('\n'),yaml:yaml,md:mds.join('\n\n'), id:cleanedBook._id, title:filterAlphaNum(cleanedBook.name)}, res, req)
 
    }
    catch(err){
       res.status(404).send(err)
    } 
  },
}