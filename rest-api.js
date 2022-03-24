// Import password encryptor
const passwordEncryptor = require('./passwordEncryptor');

// Import non-generic customized REST routes
const specialRestRoutes = require('./rest-api-special');

const aclCheck = require('./acl');

const userTable = 'Customer';
const passwordField = 'password';

let db;

//helper function to run queries
function runQuery(tablename, request, response, params, sqlAsText, noArray = false) {
  
  if(!aclCheck(tablename, request)){
    response.status(405);
    response.json({__error: 'Method Not Allowed!'});
    return;
  }
  
  let result
  try {
    let stmt = db.prepare(sqlAsText)

    //check if it should use stmt.run() or stmt.all()
    let method = sqlAsText.trim().toLowerCase().indexOf('select') === 0 ? 'all' : 'run'
    result = stmt[method](params)
  } catch (error) {
    result = { _error: error + '' }
  }

  //if we only want to return on result, also set to null if result is empty
  if (noArray) { result = result[0] }
  result = result || null

  //check if the result is non-faulty and then set corresponding response-code
  response.status(result ? (result._error ? 500 : 200) : 404)
  response.json(result)
}

//export the function as a node.js module for use in other .js files
//This function is the core of the rest-api
module.exports = function setupRESTapi(app, dbConnection) {
  db = dbConnection;

  //get all the tables and views in the db except for sqlite generated
  let tablesAndViews = db.prepare(`
  SELECT name, type FROM sqlite_schema WHERE (type = 'table' OR type = 'view') AND name NOT LIKE 'sqlite_%';
  `).all()
  //console.log(tablesAndViews)

  //add special route for listing all tables and views
  app.get('/api/tablesAndViews', (request, response) => {

    if(!aclCheck('tablesAndViews', request)){
      response.status(405);
      response.json({__error: 'Method Not Allowed!'});
      return;
    }

    response.json(tablesAndViews)
  })

  for (let { name, type } of tablesAndViews) {
    //create a route to get all tables and views in the db
    //req and res are returned and the method call => is triggered (weird syntax yes)
    app.get('/api/' + name, (request, response) => {
      // run statement to get all data
      runQuery(name, request, response, {}, `
        SELECT * FROM ${name};
      `)
    })

    //create a route to get a single item from a table or view
    //the /:id is express syntax, that can look for a specific column name (i think?)
    //and just :id is sqlite syntax
    app.get('/api/' + name + '/:id', (request, response) => {
      runQuery(name, request, response, request.params, `
        SELECT * FROM ${name} WHERE id = :id
     `, true)
    })

    //dont add post, put, and delete routes (we dont want this for db views)
    if (type === 'view') {
      continue
    }

    //add post route
    app.post('/api/' + name, (request, response) => {
      //do not allow id's to be sent manually (auto incremented id in db)
      delete request.body.id

      // If post to user table, encrypt pw in message body
      if (name === userTable) {
        request.body[passwordField] = passwordEncryptor(request.body[passwordField]);
      }

      runQuery(name, request, response, request.body, `
        INSERT INTO ${name} (${Object.keys(request.body)}) VALUES (${Object.keys(request.body).map(x => ':' + x)})
      `)
    })

    //add put and patch (update) routes
    let putNpatchFunc = (request, response) => {
      // If put/patch to user table, encrypt pw in message body
      if (name === userTable) {
        request.body[passwordField] = passwordEncryptor(request.body[passwordField]);
      }

      runQuery(name, request, response, { ...request.body, ...request.params }, `
        UPDATE ${name} SET ${Object.keys(request.body).map(x => x + ' = :' + x)} WHERE id = :id
      `)
    }
    app.put('/api/' + name + '/:id', putNpatchFunc)
    app.patch('/api/' + name + '/:id', putNpatchFunc)

    //add delete route
    app.delete('/api/' + name + '/:id', (request, response) => {
      runQuery(name, request, response, request.params, `
      DELETE FROM ${name} WHERE id = :id;
      `)
    })
  }

  // Call specialRestRoutes module, inject app & runQuery into it
  specialRestRoutes(app, runQuery, db);

  //add 404 route (will match this route if no other routes matches the request)
  app.all('/api/*', (request, response) => {
    response.status(404)
    response.json({ _error: 'No such route' })
  })

  //add our own middleware to catch errors occuring bc of invalid JSON syntax
  //runs for every query (express works this way)
  app.use((error, request, response, next) => {
    if (error) {
      let result = {
        _error: error + ''
      }
      response.json(result)
    } else {
      //callig next will say this middleware will not handle the response
      next()
    }
  })
}