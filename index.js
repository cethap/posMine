process.env.PGUSER = "openpg";
process.env.PGDATABASE = "testImp";
process.env.PGPORT = 5432;
process.env.PGPASSWORD = "openpgpwd";
process.env.PGHOST = "localhost";

var express = require('express');
var bodyParser = require('body-parser');
var service = require('./service');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/products', function(req, res) {
    service.get_products().then(function(data) {
        res.send(data);
    });
});

app.get('/actualizar_precios', function(req, res) {
    res.sendFile(__dirname + '/views/actualizar_precios.html');
});

app.post('/actualizar_precios', function(req, res) {
    service.update_lote_product_price(req.body);
    res.send('aaa');
});

app.get('/crear_productos_masivos', function(req, res) {
    res.sendFile(__dirname + '/views/crear_productos_masivos.html');
});

app.post('/crear_productos_masivos', function(req, res) {
    service.crear_productos_masivos(req.body);
    res.send('aaa');
});

app.get('/agregar_inventario', function(req, res) {
    res.sendFile(__dirname + '/views/agregar_inventario.html');
});

app.post('/agregar_inventario', function(req, res) {
    service.add_inventory_product(req.body);
    res.send('aaa');
});


app.post('/new_inventary', function(req, res) {
    service.new_inventory({name:"Inventario "+(new Date()).toGMTString()}).then(function(data){
        let p = JSON.parse(req.body.products);
        for(i=0;i<p.length;i++){
            p[i].inv = data;
        }
        p = JSON.stringify(p);

        service.update_lote_product_price(JSON.parse(p),function(rs1){
            service.add_inventory_product(JSON.parse(p),function(rs2){
                service.inventory_done(data).then(function(){
                    res.send(JSON.parse(p),rs1,rs2);
                });
            });
        });

    }).catch(function(err){
        res.send({error:err});
    });
});


service.connect().then(function() {
    app.listen(3000, function() {
        console.log('Example app listening on port 3000!')
    });
});