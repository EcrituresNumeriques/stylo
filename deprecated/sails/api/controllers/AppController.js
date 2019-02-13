module.exports = {
  index: function (req, res) {
    if(process.env.NODE_ENV == "production"){
      return res.sendfile(sails.config.appPath + '/dist/index.html');
    }
    else{
      res.view('index');
    }
  },
};
