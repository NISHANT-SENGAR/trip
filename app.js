const express = require('express'); //(1+2)=> var app = require('express')();
const app = express();
const http = require('http').createServer(app);
var path = require('path');
var bodyParser = require('body-parser');
// var firebase = require('firebase-admin');

var user = require('./router/user.js');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    next();
});

app.get('/', (req, res) => {
    res.send('HAHAHAAHAH')
});


const PORT = process.env.PORT || 3001
http.listen(PORT, () => console.log(`Listening on port  ${PORT}`));

app.use(express.static(path.join(__dirname + "/client")))



// Routing // 

app.use('/', user);




module.exports = app;