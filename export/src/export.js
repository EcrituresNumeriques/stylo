
module.exports = {
  exportArticleHtml: (req,res,next)=>{
    res.send(`<p>Exporting Article ${req.params.id} to HTML</p>`)
  }
}