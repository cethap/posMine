var Client = require('pg').Client;
var client = new Client();
var Odoo = require('node-odoo');
var Odoo2 = require('odoo-xmlrpc');

var paramsEnv = {
    host: 'localhost',
    port: 8069,
    database: 'aqui',
    username: 'caja@aqui.com',
    password: 'Aqui123'
}

/*var paramsEnv = {
    host: 'aqui-pos.local',
    port: 8069,
    database: 'aqui_2',
    username: 'caja@aqui.com',
    password: 'Aqui123'
}*/

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


function con(pro, arr, index) {
    if (index == arr.length) return;
    let next = index + 1;
    con(pro.then(arr[index]), arr, next);
}

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
                console.log('Connected to DB');
                rs();
            }).catch(function(err) {
                console.log('no Connected to DB', err);
                odooDBIsConnect = false;
            });
        });

        return new Promise(function(rs, rj) {
            Promise.all([odooJ, odooX, odooDB]).then(function() {
                rs();
            });
        });

    },
    productsLite:function(){
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
                ORDER BY product ASC
            `, function(err, res) {
                //client.end();
                if (err) return rj(err);
                rs(res.rows);
            });            
        });
    },
    get_products: function() {
        return new Promise(function(rs, rj) {
            if (!odooDBIsConnect) return rs({ connect: false });

            var inParams = [];
            inParams.push([]);
            var params = [];
            params.push(inParams);
            odooXML.execute_kw('product.product', 'search', params, function(err, value) {
                if (err) { return console.log(err); }
                odooXML.execute_kw('product.product', 'read', [
                    [value, [
                        'id', 'name', 'barcode', 'list_price', 'description_sale', 'location_id', 'description', 'pos_categ_id', 'qty_available'
                    ]]
                ], function(err, value) {
                    if (err) { return console.log(err); }
                    rs(value);
                });
            });

        })
    },
    new_inventory: function(inv) {
        return new Promise(function(rs, rj) {
            if (!odooJIsConnect) return rs({ connect: false });
            var inParams = {
                'name': inv.name,
                'filter': 'partial',
                'state': 'confirm'
            };
            odoo.create('stock.inventory', inParams, function(err, inventory) {
                if (err) return rj(err);
                rs(inventory);
            });
        });
    },
    add_inventory_product: function(pro, callback) {
        var intelval = [];
        if (!callback) callback = function() {};

        function update(element) {
            return new Promise(function(rs, rj) {
                if (!odooJIsConnect) return rs({ connect: false });
                if (!element.id) return rs({ id: false });

                var inParams = {
                    'inventory_id': element.inv,
                    'product_id': parseInt(element.id, 10),
                    'product_qty': parseInt(element.qty, 10),
                    'location_id': 15
                };
                odoo.create('stock.inventory.line', inParams, function(err, product_inv) {
                    if (err) return rj(err.data.message);
                    console.log("fine add_inventory_product", product_inv);
                    rs(product_inv);
                });
            })
        }

        for (var i = 0; i < pro.length; i++) {
            if (i == 19 || i == pro.length - 1) {
                let range = pro.splice(0, i + 1);
                intelval.push(function() {
                    return new Promise(function(rs, rj) {
                        let lp = [];
                        for (y = 0; y < range.length; y++) {
                            lp.push(new Promise(function(rs, rj) {
                                let dat = JSON.parse(JSON.stringify(range[y]));
                                update(dat).then(function(params) {
                                    rs(dat);
                                }).catch(function(err) {
                                    rs(dat);
                                    console.error(err);
                                })
                            }))
                        }
                        Promise.all(lp).then(function(data) {
                            rs(data);
                            //console.log("se termino", data);
                        }).catch(function(data) {
                            rj(data);
                            console.log('error', data);
                        });
                    });
                });
                i = 0;
            }
        }

        intelval.push(callback);

        con(Promise.resolve(), intelval, 0);

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
                'barcode': product.barcode,
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
    },
    update_lote_product_price: function(product, callback) {
        var intelval = [];

        function update(element) {
            return new Promise(function(rs, rj) {
                if (!odooJIsConnect) return rs({ connect: false });
                if (!element) return rs({ id: false });
                if (!element.id) return rs({ id: false });
                var inParams = {
                    'list_price': element.list_price,
                    'name': element.product
                };
                if (element.barcode) {
                    inParams.barcode = element.barcode;
                }
                odoo.update('product.product', parseInt(element.id, 10), inParams, function(err, product) {
                    if (err) return rj({ err: err, element: element });
                    rs(product);
                    console.log("fine update_lote_product_price", product);
                });
            })
        }

        for (var i = 0; i < product.length; i++) {
            if (i == 19 || i == product.length - 1) {
                let range = product.splice(0, i + 1);
                intelval.push(function() {
                    return new Promise(function(rs, rj) {
                        let lp = [];
                        for (y = 0; y < range.length; y++) {
                            lp.push(new Promise(function(rs, rj) {
                                let dat = JSON.parse(JSON.stringify(range[y]));
                                update(dat).then(function(params) {
                                    rs(dat);
                                }).catch(function(err) {
                                    rs(dat);
                                    console.error(err);
                                })
                            }))
                        }
                        Promise.all(lp).then(function(data) {
                            rs(data);
                            //console.log("se termino update_lote_product_price");
                        }).catch(function(data) {
                            rj(data);
                            console.log('error', data);
                        });
                    });
                });
                i = 0;
            }
        }

        intelval.push(callback);

        con(Promise.resolve(), intelval, 0);
    },
    crear_productos_masivos: function(product, callback) {

        if (!callback) callback = function() {};
        var intelval = [];
        var productsArr = [];
        var productsAcept = [];

        for (var index = 0; index < product.length; index++) {
            var element = product[index];
            if (!element.id) {
                productsAcept.push(element);
            }
        }

        function create(element) {
            return new Promise(function(rs, rj) {
                if (!odooJIsConnect) return rs({ connect: false });
                if (!element.product) return rs({ id: false });
                if (element.id) return rs({ id: false });

                var inParams = {
                    'name': element.product,
                    'barcode': element.barcode || null,
                    'lst_price': element.list_price,
                    'taxes_id': null,
                    'supplier_taxes_id': null,
                    'type': 'product'
                };

                odoo.create('product.product', inParams, function(err, product) {
                    if (err) return rj({ err: err, element: element });
                    element.id = product;
                    productsArr.push(element);
                    rs(productsArr);
                    console.log("fine crear_productos_masivos", product);
                });
            })
        }

        for (var i = 0; i < productsAcept.length; i++) {
            if (i == 0 || i == productsAcept.length - 1) {
                let range = productsAcept.splice(0, i + 1);
                intelval.push(function() {
                    return new Promise(function(rs, rj) {
                        let lp = [];
                        for (y = 0; y < range.length; y++) {
                            lp.push(new Promise(function(rs, rj) {
                                let dat = JSON.parse(JSON.stringify(range[y]));
                                create(dat).then(function(params) {
                                    rs(dat);
                                }).catch(function(err) {
                                    rs(dat);
                                    console.error(err);
                                })
                            }))
                        }
                        Promise.all(lp).then(function(data) {
                            rs(data);
                            //console.log("se termino crear_productos_masivos");
                        }).catch(function(data) {
                            rj(data);
                            console.log('error', data);
                        });
                    });
                });
                i = 0;
            }
        }

        intelval.push(callback);

        con(Promise.resolve(), intelval, 0);
    }
};
