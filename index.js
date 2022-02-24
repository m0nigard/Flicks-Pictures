//port for web server
const port = 3000

//import express
const express = require('express')

//create web server using express 
const app = express()

//serve all the files in the frontend folder using middleware static
//use middleware json to be able to read request-bodies (POST, PUT, PATCH)
app.use(express.static('frontend'))
app.use(express.json({ limit: '100MB' }))

//start the web server
app.listen(3000, () => console.log('Listening on http://localhost:' + port))

//import the restapi function from the rest-api.js file
const setupRESTapi = require('./rest-api.js')
setupRESTapi(app)