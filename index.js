process.env.PGPASSWORD = "I$h3r3";
process.env.PGHOST = "aqui-pos.local";

var express = require('express');
var service = require('./service');
var app = express();


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/products', function(req, res) {
    service.get_products().then(function(data) {
        res.send(data);
    });
});

service.connect().then(function() {
    app.listen(3000, function() {
        console.log('Example app listening on port 3000!')
    });
});