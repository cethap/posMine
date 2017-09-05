process.env.PGUSER = 'postgres';
process.env.PGDATABASE = 'aqui';
process.env.PGPORT = 5432;
process.env.PGPASSWORD = "I$h3r3";
process.env.PGHOST = "localhost";

/*process.env.PGUSER = "postgres";
process.env.PGDATABASE = "aqui_2";
process.env.PGPORT = 5432;
process.env.PGPASSWORD = "I$h3r3";
process.env.PGHOST = "aqui-pos.local";*/

var express = require('express');
var bodyParser = require('body-parser');
var service = require('./service');
var app = express();
var iniciado = false;

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public'));


app.get('/iniciar', function(req, res) {
    if(!iniciado){
       service.connect().then(function() {
         res.writeHead(302, { 'location': '/inventario'});
         res.end();
         iniciado = true;
       });
    }else{
       res.writeHead(302, { 'location': '/inventario'});
       res.end();
    }
});

app.get('/inventario', function(req, res) {
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
    var pro = req.body.products.split('\n');
    var products = [];
    for (var index = 0; index < pro.length; index++) {
        var element = pro[index].split(';');
        products.push({
            barcode: element[0],
            product: element[1],
            list_price: element[2]
        });
    }
    service.crear_productos_masivos(products, function(data) {
        res.send({ rs: 1, data: data });
    });
});

app.get('/agregar_inventario', function(req, res) {
    res.sendFile(__dirname + '/views/agregar_inventario.html');
});

app.post('/agregar_inventario', function(req, res) {
    var pro = req.body.products.split('\n');
    var products = [];
    for (var index = 0; index < pro.length; index++) {
        var element = pro[index].split(';');
        products.push({
            inv: element[0],
            id: element[1],
            qty: element[2],
            location: element[3],
        });
    }
    service.add_inventory_product(products);
    res.send('aaa');
});


app.post('/new_inventary', function(req, res) {
    service.new_inventory({ name: "Inventario " + (new Date()).toGMTString() }).then(function(data) {
        let p = JSON.parse(req.body.products);

        service.crear_productos_masivos(p, function(news) {

            p = p.concat(news);

            for (i = 0; i < p.length; i++) {
                p[i].inv = data;
            }

            p = JSON.stringify(p);

            service.update_lote_product_price(JSON.parse(p), function(rs1) {
                service.add_inventory_product(JSON.parse(p), function(rs2) {
                    service.inventory_done(data).then(function() {
                        res.send(JSON.parse(p), rs1, rs2);
                    });
                });
            });
        });

    }).catch(function(err) {
        res.send({ error: err });
    });
});


app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
});
