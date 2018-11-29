/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  // NOTE all routes defined before the 'GET /*' will override

  //User
  //Register
  'POST /api/v1/register':'User_RegisterController.newUser',
  //Login
  'POST /api/v1/login':'User_LoginController.validateLogin',
  //logout user
  'POST /api/v1/logout':'User_LoginController.logout',
  //status
  'GET /api/v1/status':'User_StatusController.status',
  //Update infos
  'POST /api/v1/profile':'UsersController.updateInfos',

  //Articles
  'GET /api/v1/my-articles':'ArticlesController.findMine',
  'GET /api/v1/articles':'ArticlesController.find',
  'GET /api/v1/articles/:id':'ArticlesController.findLastVersions',
  'POST /api/v1/articles':'ArticlesController.create',
  'POST /api/v1/articles/:id':'ArticlesController.update',
  'POST /api/v1/share-articles/:id':'ArticlesController.share',
  'DELETE /api/v1/articles/:id':'ArticlesController.removeFromOwners',

  //Versions
  'GET /api/v1/versions':'VersionsController.find',
  'GET /api/v1/versions/:id':'VersionsController.findOne',
  'POST /api/v1/versions/:id/fork':'VersionsController.fork',
  'POST /api/v1/versions/autosave':'VersionsController.autosave',
  'POST /api/v1/versions':'VersionsController.newVersion',
  'PATCH /api/v1/versions/:id':'VersionsController.update',
  'DELETE /api/v1/versions/:id':'VersionsController.destroy',


  //exports
  'GET /api/v1/htmlVersion/:version':'ExportController.html',
  'GET /api/v1/htmlArticle/:id':'ExportController.article',
  'GET /api/v1/zipArticle/:id':'ExportController.articleZIP',
  'GET /api/v1/zipVersion/:version':'ExportController.versionZIP',



  // Admin sections
  'GET /api/v1/admin/users':'AdminController.users',
  'GET /api/v1/admin/articles':'AdminController.articles',

  // All GET requests are directed to the app controller which renders our app.
  'GET /*': {
    controller: 'AppController',
    action: 'index',
    skipAssets: true,
  },

};
