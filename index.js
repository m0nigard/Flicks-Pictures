// Import the better-sqlite3 module & connect to SQLite database
const betterSqlite3 = require('better-sqlite3');
const db = betterSqlite3('./database/cinema.sqlite3');

//port for web server
const port = 3000

//import express
const express = require('express')
const path = require('path')

//create web server using express 
const app = express()

//serve all the files in the frontend folder using middleware static
//use middleware json to be able to read request-bodies (POST, PUT, PATCH)
app.use(express.static('frontend'))
app.use(express.json({ limit: '100MB' }))

//start the web server
app.listen(3000, () => console.log('Listening on http://localhost:' + port))

// Import the login.js function and call it
const login = require('./login.js');
login(app, db);

//import the restapi function from the rest-api.js file
const setupRESTapi = require('./rest-api.js')
setupRESTapi(app, db)

app.all('/partials/*', (req, res) => {
    res.status(404)
    res.set('Content-Type', 'text/html')
    res.sendFile(path.join(__dirname, 'frontend', 'partials', '404.html'))

});