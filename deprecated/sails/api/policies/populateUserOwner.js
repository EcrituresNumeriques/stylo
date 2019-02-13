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

    // Set the default `id` and `id_group` for "create" and "updates" blueprints
    if(req.session.user){        
        req.options.values.owner = [req.session.user.id];
    }
    //console.log(req.options);
    //jump to next policy
    next();
};
