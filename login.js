const session = require('express-session');
const store = require('better-express-store');

const passwordEncryptor = require('./passwordEncryptor');

const passwordField = 'password';

// Export code as module
module.exports = function (app, db) {
  // Register the express-session module as express middleware
  app.use(session({
    secret: 'ChocolatePuddingOtterPancakeDilemma',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: 'auto' },
    store: store({ dbPath: './database/cinema.sqlite3' })
  }));

  // Setting up /api/login routes to allow log in/out
  app.post('/api/login', (req, res) => {
    // Encrypt the password
    req.body[passwordField] = passwordEncryptor(req.body[passwordField]);

    // Look for user on username/pwd in db
    let stmt = db.prepare(`
      SELECT * FROM Customer
      WHERE username = :username AND password = :password
    `);
    let result = stmt.all(req.body)[0] || { _error: 'No such user.' };

    delete result.password;   // Remove password from result

    // If login successful, store user in 'session'. Unique for each connection.
    if (!result._error) {
      req.session.user = result;
    }

    res.json(result);
  });

  // Used to check if logged in
  app.get('/api/login', (req, res) => {
    res.json(req.session.user || { _error: 'Not logged in' });
  });

  // Delete to logout 
  app.delete('/api/login', (req, res) => {
    delete req.session.user;
    res.json({});
  });
}
