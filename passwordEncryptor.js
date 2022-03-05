// Built-in NodeJs crypto module to hash passwords
const crypto = require('crypto');

const salt = 'SecretCinemaPopcornButterSprinklesCandySauce554433!';

module.exports = function (password) {
  if (typeof password !== 'string') { return null }
  return crypto
    .createHmac('sha256', salt)
    .update(password)
    .digest('hex');
}