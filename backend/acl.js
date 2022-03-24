const aclRules = require('../acl-rules.json');

module.exports = function (tableName, req) {
  
  let userRole = req.session.user ? 'customer' : 'guest';
  let method = req.method.toLowerCase();

  // since we only specify put (not patch) in the rules change patch to put 
  // for the actual used method in order to make it work with our rules
  method = method === 'patch' ? 'put' : method;

  // now can go into the rules and check if a certain REST api-route
  // is allowed for a certain user Role

  
  let allowed = aclRules?.[userRole]?.[tableName]?.[method];

  // !! = converts undefined to the boolean false, true to true etc
  // (not necessary but being a bit strict here, the method should only return true or false)
  return !!allowed;
}