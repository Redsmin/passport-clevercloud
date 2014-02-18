var util = require('util')
, Strategy = require('passport-strategy')
, moment = require('moment')
, crypto = require('crypto');

function clevercloudStrategy(salt){
  this.salt = salt;
  Strategy.call(this);
}

util.inherits(CustomStrategy, Strategy);

clevercloudStrategy.prototype.authenticate = function(body, options) {
  id = body.id;
  timestamp = moment(body.timestamp);
  token = body.token;
  nav-data = body.nav-data;
  email = body.email;

var shasum = crypto.createHash('sha1');
shasum.update(id + timestamp._i.toString() + this.salt); //.bind(this)
digest = shasum.digest('hex');


if(digest == this.token){
  dateTime = moment(Date.now());
  if(dateTime.isAfter(timestamp) && timestamp.add(5, 'm').isAfter(dateTime)){

  }
}
}
