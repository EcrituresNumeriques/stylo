
module.exports = {
  exportArticleHtml: (req,res,next)=>{
    res.send(`<p>Exporting Article ${req.params.id} to HTML</p>`)
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