module.exports = {
  index: function (req, res) {
    let prod = true;
    if(prod){
      return res.sendfile(sails.config.appPath + '/dist/index.html');
    }
    else{
      res.view('index');
    }
  },
};
