/**
 * populateUserInfos
 *
 * @module      :: Policy
 * @description :: Prepopulate user information to create new models.
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

    //get previously set values
    req.options.values = req.options.values || {};

    // Set the default `id_user` and `id_group` for "create" and "updates" blueprints
    req.options.values.id_user = req.session.user.id_user;
    req.options.values.id_group = req.session.user.id_group;
    //console.log(req.options);
    //jump to next policy
    next();
};
