// var Odoo = require('odoo-xmlrpc');
// var paramsEnv = {
//   host: 'localhost',
//   port: 8069,
//   database: 'testImp',
//   username: 'caja@aqui.com',
//   password: 'Aqui123'
// }

// var odooXML = new Odoo({
//   url: 'http://' + paramsEnv.host,
//   port: paramsEnv.port,
//   db: paramsEnv.database,
//   username: paramsEnv.username,
//   password: paramsEnv.password
// });

// odooXML.connect(function (err) {
//   if (err) { return console.log(err); }
//   console.log('Connected to odooXML server.');
//   var inParams = [];
//   inParams.push([]);
//   var params = [];
//   params.push(inParams);
//   odooXML.execute_kw('product.product', 'search', params, function (err, value) {
//       if (err) { return console.log(err); }

//       odooXML.execute_kw('product.product', 'read', [[value,[
//             'id','name','barcode','list_price','description_sale','location_id','description','pos_categ_id','qty_available'
//       ]]], function (err, value) {
//           if (err) { return console.log(err); }
//           console.log('Result: ', value);
//       });      
//   });
// });


var Odoo = require('node-odoo');

var paramsEnv = {
    host: 'localhost',
    port: 8069,
    database: 'aqui',
    username: 'cethapgames@gmail.com',
    password: 'Cethap01'
}

var odoo = new Odoo({
  host: paramsEnv.host,
  port: paramsEnv.port,
  database: paramsEnv.database,
  username: paramsEnv.username,
  password: paramsEnv.password
});

odoo.connect(function(err) {
  console.log('Connected to Odoo server JSON.');
  if (err) { return console.log(err); }

  var inParams = {
    'partner_id': 99, 
    'name': 'PO00123',
    'location_id':12,
    "state": "purchase"
  };
  odoo.create('purchase.order', inParams, function(err, order) {
    if (err) return console.error(err);
    console.log(order);

    var pro = '__export__.product_product_1706'.split('_');
    var unit = 'product.product_uom_unit'.split('_');
    var taxes = '__export__.account_tax_437'.split('_');

    var inParams =
      {
        'name':'from Command',
        'product_id':parseInt(pro[pro.length-1],10),
        'product_uom':(unit[unit.length-1] == 'unit')?1:2,
        "amount_tax": 19.0,        
        'product_qty':20,
        "qty_received": 20,
        "taxes_id": [[6, false, [parseInt(taxes[taxes.length-1],10)]]],
        "company_id": 1,
        "state": "purchase",
        'date_planned':(new Date).toISOString(),
        'price_unit':2000,
        'order_id': order       
      };

    odoo.create('purchase.order.line', inParams, function(err, product_line) {
      if (err) return console.error(err);
      console.log(product_line);
    });

  });

});



// "External ID","Proveedor/ID","Referencia del pedido","Líneas del pedido/Cantidad","Líneas del pedido/Descripción","Líneas del pedido/Impuestos/ID","Líneas del pedido/Precio unitario","Líneas del pedido/Producto/ID","Líneas del pedido/Unidad de medida del producto/ID","Líneas del pedido/Producto/Precio de venta","Líneas del pedido/Producto/Código de barras"
// "__export__.purchase_order_47","99","PO00123","20.0","from Command","437","2000.0","1706","1","0.0",""
// "","","","1.0","3UND PURO HORTEN X 450G","70","5000.0","967","1","3000.0","7861001349054"

//Validar por codigo de barras
//Validar por id
//Validar por nombre


