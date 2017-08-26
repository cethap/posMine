process.env.PGPASSWORD = "I$h3r3";
process.env.PGHOST = "aqui-pos.local";

var Client = require('pg').Client;
var client = new Client();


console.log(process.env.PGHOST, process.env.PGUSER, process.env.PGPASSWORD, process.env.PGDATABASE, process.env.PGPORT)

client.connect().then(function() {
    client.query('select * from product_product', function(err, res) {
        console.log(err ? err.stack : res.rows) // Hello World!
        client.end();
    });
});