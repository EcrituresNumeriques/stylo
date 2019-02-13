/**
 *AdminController.js
 *
 * @description :: Server-side logic for administrative tasks
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  users: function (req, res) {
    // console.log("Logging in");
    Users.find().exec(function (err, Users) {
      if (err) { return res.serverError(err) }
      // console.log("userfound",thisUsersArticle);
      res.ok(Users)
    })
  },
  articles: function (req, res) {
    // console.log("Logging in");
    Articles.find().exec(function (err, Articles) {
      if (err) { return res.serverError(err) }
      // console.log("userfound",thisUsersArticle);
      res.ok(Articles)
    })
  }
}
