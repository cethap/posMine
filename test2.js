var Odoo = require('odoo-xmlrpc');
var paramsEnv = {
  host: 'localhost',
  port: 8069,
  database: 'testImp',
  username: 'caja@aqui.com',
  password: 'Aqui123'
}

var odooXML = new Odoo({
  url: 'http://' + paramsEnv.host,
  port: paramsEnv.port,
  db: paramsEnv.database,
  username: paramsEnv.username,
  password: paramsEnv.password
});

odooXML.connect(function (err) {
  if (err) { return console.log(err); }
  console.log('Connected to odooXML server.');
  var inParams = [];
  inParams.push([]);
  var params = [];
  params.push(inParams);
  odooXML.execute_kw('product.product', 'search', params, function (err, value) {
      if (err) { return console.log(err); }

      odooXML.execute_kw('product.product', 'read', [[value,[
            'id','name','barcode','list_price','description_sale','location_id','description','pos_categ_id','qty_available'
      ]]], function (err, value) {
          if (err) { return console.log(err); }
          console.log('Result: ', value);
      });      
  });
});