/**
 * ownsThis
 *
 * @module      :: Policy
 * @description :: Check if user is either admin or the owner of the item requested
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  //console.log("enter ownsthis")
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller

  if (req.session.user && req.session.user.admin) {
    //User is admin, bypass check
    return next();
  }
  else {
    return res.forbidden({message:'you do not own this record.'});
  }
};
