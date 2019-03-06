import hostConfig from 'host.config';

// Server Storage is trying to mimic the behavior of a database (query,insert,update)
// It is just for a basic concept of what database need to do here
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const secret = hostConfig.secret;

// All keys/password in database should be already encrypted
const serverStorage = {
  // SECRET KEY
  secret: crypto.createHmac('sha256', secret).digest('base64'),

  // USERS INFORMATIONS
  users: {
    ['up']: {
      user: 'up',
      type: 'super',
      pwd: bcrypt.hashSync('up', 10),
      email: 'admin@up.com',
      sessions: {
        // [session.id] : { id: session.id, token: session.token }
      }
    },
    ['hello']: {
      user: 'hello',
      type: 'member',
      pwd: bcrypt.hashSync('world', 10),
      email: 'hello@world.com',
      sessions: {
        // [session.id] : { id: session.id, token: session.token }
      }
    }
  },

  // METHOD TO FIND AN USER (FOR CHECK & SIGIN IN)
  findUser: function (userID) {
    return typeof userID === 'string' && userID ? this.users[userID] || null : null;
  },

  // METHOD TO ADD USER (FOR SIGN UP)
  addUser: function (user) {
    if (
      user.name && !serverStorage.users[user.name] &&
      user.type &&
      user.pwd &&
      user.email) {
      serverStorage.users[user.name] = {
        user: user.name,
        type: user.type,
        pwd: bcrypt.hashSync(user.pwd, 10),
        email: user.email
      };
      return serverStorage.users[user.name];
    } else {
      return null;
    }
  },

  // CHECK USER/PASSWORD MATCHED
  checkAuthentication: function (user, password) {
    let foundUser = this.findUser(user);
    if (foundUser) {
      return bcrypt.compareSync(password || '', foundUser.pwd) ? {
        name: foundUser.user
      } : null;
    }
    return null;
  },

  // METHOD TO ADD USER SESSION ID && TOKEN
  // Normally with some session store like connect-mongo
  // You shall have the benefit of automatically delete sessions on expiring
  // But this is our own fake database, we shall mimic that action in a most simple way (setTimeout)
  timeouts: {},
  addSessionToUser: function (userID, session, maxAge, onExpire) {
    let self = this;
    let foundUser = self.findUser(userID);
    if (
      foundUser &&
      session &&
      maxAge
    ) {
      // If the timeout handler exist, remove it to add new timeout
      if (self.timeouts[session.id] && Object.keys(self.timeouts[session.id]).length) {
        Object.keys(self.timeouts[session.id]).forEach(function (uID) {
          if (self.timeouts[session.id][uID]) {
            clearTimeout(self.timeouts[session.id][uID]);
            self.timeouts[session.id][uID] = null;
          }
        });
        self.timeouts[session.id][userID] = null;
      } else {
        // Initial the timeout property
        self.timeouts[session.id] = {
          [userID]: null
        }
      }

      // Add session to database
      self.users[userID].sessions[session.id] = session;

      // Delete expired session in all users by session id
      Object.keys(self.timeouts[session.id]).forEach(function (uID) {
        self.timeouts[session.id][uID] = setTimeout(function () {
          let foundUser = self.findUser(uID);
          if (foundUser) {
            onExpire(uID, session.id);
            delete self.users[uID].sessions[session.id];
          }
        }, maxAge);
      });
      return self.users[userID].sessions[session.id];
    } else {
      return null;
    }
  },
  // METHOD TO CHECK WHETHER SESSION IS ATTACHED TO USER
  isSessionRegistered: function (userID, sessionID) {
    let foundUser = this.findUser(userID);
    if (
      foundUser &&
      sessionID
    ) {
      return foundUser.sessions[sessionID] || null;
    } else {
      return null;
    }
  }
};

export default serverStorage;