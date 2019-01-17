module.exports = (args,req) => {
  
    if(args.article == "new"){
        if(req.created && req.created.article){args.article = req.created.article}
        else{throw new Error('No article was created in this mutation request')}
    }

    if(args.tag == "new"){
        if(req.created && req.created.tag){args.tag = req.created.tag}
        else{throw new Error('No tag was created in this mutation')}
    }
    
    //version

    //password
    //token
    //User ??

    return args

}