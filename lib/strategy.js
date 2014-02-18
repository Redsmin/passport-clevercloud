var util            = require('util')
, Strategy          = require('passport-strategy')
, moment            = require('moment')
, crypto            = require('crypto')
, ProvisionResponse = require('./errors/ProvisionResponse');

/**
 * Creates an instance of `CleverCloudStrategy`.
 *
 * The CleverCloud authentication strategy authenticates SSO requests from CleverCloud.
 *
 * Applications must supply a `verify` callback, for which the function
 * signature is:
 *
 *     function(id, email, done) { ... }
 *
 * The verify callback is responsible for finding or creating the user, and
 * invoking `done` with the following arguments:
 *
 *     done(err, user, info);
 *
 * `user` should be set to `false` to indicate an authentication failure.
 * Additional `info` can optionally be passed as a third argument, typically
 * used to display informational messages.  If an exception occured, `err`
 * should be set.
 *
 * Options:
 *
 *   - `sso_salt`              SSO Salt
 *
 * Examples:
 *
 *     passport.use(new CleverCloudStrategy({
 *         sso_salt: 'secret'
 *       },
 *       function(id, email, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function CleverCloudStrategy(options, verify){
  options   = options || {};

  if (!verify) { throw new TypeError('CleverCloudStrategy requires a verify callback'); }
  if (!options.sso_salt) { throw new TypeError('CleverCloudStrategy requires a sso_salt option'); }

  Strategy.call(this);
  this.name      = 'clevercloud';
  this._sso_salt = options.sso_salt;
  this._verify   = verify;
}

util.inherits(CleverCloudStrategy, Strategy);

CleverCloudStrategy.prototype.authenticate = function(req, options) {
  var id          = req.body.id;
  var requestTime = moment(req.body.timestamp);
  var token       = req.body.token;
  var email       = req.body.email;

  var shasum      = crypto.createHash('sha1');
  shasum.update(id + ':' + requestTime.valueOf() + ':' + this._sso_salt);
  var digest      = shasum.digest('hex');

  if(digest !== token){
    this.error(new ProvisionResponse("You cannot have access to this addon", 403));
    return;
  }

  if(!(moment().subtract(5, 'm').isBefore(requestTime) && moment().isAfter(+requestTime))){
    this.error(new ProvisionResponse("The token is too old", 403));
    return;
  }

  function verified(err, user, info) {
    if (err) {
      return this.error(err);
    }

    if (!user) {
      return this.fail(info);
    }

    this.success(user, info);
  }
  this._verify(id, email, verified.bind(this));
};

module.exports = CleverCloudStrategy;
