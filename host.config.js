// GET LOCAL IP
const myIP = require('quick-local-ip');
const secret = 'Hello World From Secret';

// EXPORT DEFAULT
module.exports = {
  lan: myIP.getLocalIP4(),
  name: 'localhost',
  public: '0.0.0.0',
  port: 20987, // My Birthday lolz!
  basicAuth: {
    username: 'up',
    password: 'helloWorld'
  },
  secret,
  globalMaxAge: 1000 * 60 * 60 * 24 // 1 day
};