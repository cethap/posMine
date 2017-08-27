var Client = require('pg').Client;
var client = new Client();
var Odoo = require('node-odoo');
var Odoo2 = require('odoo-xmlrpc');

var paramsEnv = {
    host: 'aqui-pos.local',
    port: 8069,
    database: 'aqui_2',
    username: 'caja@aqui.com',
    password: 'Aqui123'
}

var odoo = new Odoo({
    host: paramsEnv.host,
    port: paramsEnv.port,
    database: paramsEnv.database,
    username: paramsEnv.username,
    password: paramsEnv.password
});

var odooXML = new Odoo2({
    url: 'http://' + paramsEnv.host,
    port: paramsEnv.port,
    db: paramsEnv.database,
    username: paramsEnv.username,
    password: paramsEnv.password
});

var odooJIsConnect = false;
var odooXIsConnect = false;
var odooDBIsConnect = false;


module.exports = {
    connect: function() {
        var odooJ = new Promise(function(rs, rj) {
            odoo.connect(function(err) {
                console.log('Connected to Odoo server JSON.');
                if (err) { return console.log(err); }
                odooJIsConnect = true;
                rs();
            });
        });

        var odooX = new Promise(function(rs, rj) {
            odooXML.connect(function(err) {
                console.log('Connected to Odoo server XML.');
                if (err) { return console.log(err); }
                odooXIsConnect = true;
                rs();
            });
        });

        var odooDB = new Promise(function(rs, rj) {
            client.connect().then(function() {
                odooDBIsConnect = true;
                rs();
            }).catch(function() {
                odooDBIsConnect = false;
            });
        });

        return new Promise(function(rs, rj) {
            Promise.all([odooJ, odooX, odooDB]).then(function() {
                rs();
            });
        });

    },
    get_products: function() {
        return new Promise(function(rs, rj) {
            if (!odooDBIsConnect) return rs({ connect: false });
            client.query(`
                SELECT 
                    pp.id, pt.name product, pp.product_tmpl_id, pp.barcode, 
                    pt.list_price, pt.description_sale, pt.location_id,
                    pt.description, pt.type, pc.name category
                FROM 
                    product_product pp, 
                    product_template pt
                    LEFT JOIN
                    pos_category pc ON pt.pos_categ_id = pc.id
                WHERE 
                    pt.id = pp.product_tmpl_id AND pp.active = true           
            `, function(err, res) {
                client.end();
                if (err) return rj(err);
                rs(res.rows);
            });
        })
    },
    new_inventory: function(inv) {
        return new Promise(function(rs, rj) {
            if (!odooJIsConnect) return rs({ connect: false });
            var inParams = {
                'name': inv.name,
                'filter': 'partial'
            };
            odoo.create('stock.inventory', inParams, function(err, inventory) {
                if (err) return rj(err);
                rs(inventory);
            });
        });
    },
    add_inventory_product: function(product, inv) {
        return new Promise(function(rs, rj) {
            if (!odooJIsConnect) return rs({ connect: false });
            var inParams = {
                'inventory_id': inv.id,
                'product_id': product,
                'product_qty': product.qty,
                'location_id': inv.location || 15
            };
            odoo.create('stock.inventory.line', inParams, function(err, product_inv) {
                if (err) return rj(err);
                rs(product_inv);
            });
        });
    },
    inventory_done: function(id_inv) {
        return new Promise(function(rs, rj) {
            if (!odooXIsConnect) return rs({ connect: false });
            var inParams = [];
            inParams.push([id_inv]); //id to update
            var params = [];
            params.push(inParams);
            odooXML.execute_kw('stock.inventory', 'action_done', params, function(err, value) {
                if (err) return rj(err);
                rs(value);
            });
        });
    },
    new_product: function(product) {
        return new Promise(function(rs, rj) {
            if (!odooJIsConnect) return rs({ connect: false });
            var inParams = {
                'name': product.name,
                'lst_price': product.price,
                'taxes_id': null,
                'supplier_taxes_id': null,
                'type': 'product'
            };
            odoo.create('product.product', inParams, function(err, product) {
                if (err) return rj(err);
                rs(product);
            });
        });
    }
};