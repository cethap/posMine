var app = new Vue({
    el: '#app',
    data: {
        products: [],
        barcode: '',
        nameProduct: '',
        productSelected: false,
        qtyProduct: 0,
        currentProduct: null,
        editQty: false,
        enabledQty: false,
        PriceProduct: 0,
        edit: true,
        Nproduct: {}
    },
    mounted: function() {
        this.getProducts();
        $("#barcode").focus();
        if (!localStorage.getItem("productsInv")) {
            localStorage.setItem("productsInv", '[]');
        }
    },
    methods: {
        getProducts: function() {
            var self = this;
            $.get("/products", function(data) {
                self.products = data;
                var pro = JSON.parse(localStorage.getItem("productsInv"));

                for (var i = 0; i < self.products.length; i++) {
                    var e = self.products[i];
                    var search = true;
                    for (var y = 0; search && y < pro.length; y++) {
                        if(!pro[y].id){
                            self.products.push(pro[y]);
                            pro.splice(y, 1);
                        }
                        if(pro.length-1 > i){
                            if (pro[y].id == e.id) {
                                e.qty = pro[y].qty;
                                e.list_price = pro[y].list_price;
                                pro.splice(y, 1);
                                search = false;
                            }
                        }
                    }
                }

                pro = null;
            });
        },
        removeProduct: function(indx,ev){
            ev.preventDefault();
            ev.stopImmediatePropagation();
            var el = this.products.splice(indx,1);
            var pro = JSON.parse(localStorage.getItem("productsInv"));

            function findProduct(product, index) { 
                if(product){
                    if(product.product === el[0].product){
                        pro.splice(index,1);
                    }
                }
            }
            
            pro.find(findProduct)
            localStorage.setItem("productsInv", JSON.stringify(pro));
        },
        setNewMode: function(){
            this.edit = false;
            this.Nproduct.qty = '0';
            this.Nproduct.list_price = '0';
            Vue.nextTick(function() {
                $("#barcodeN").focus();
            });            
        },
        addproduct: function() {
            if(this.Nproduct.product.length > 0 && (this.Nproduct.qty+'').length > 0 && (this.Nproduct.list_price+'').length > 0){
                this.edit = true;
                var pro = JSON.parse(localStorage.getItem("productsInv"));
                pro.push(JSON.parse(JSON.stringify(this.Nproduct)));
                localStorage.setItem("productsInv", JSON.stringify(pro));
                pro = null;
                this.products.push(JSON.parse(JSON.stringify(this.Nproduct)));
                this.Nproduct = {};
            }else{
                alert("Debe llenar almenos nombre, cantidad y precio")
            }
        },
        serQty: function() {
            if (this.productSelected && (this.qtyProduct+'').length > 0) {

                this.currentProduct.qty = parseInt(this.qtyProduct, 10);
                this.currentProduct.list_price = this.PriceProduct;
                
                var pro = JSON.parse(localStorage.getItem("productsInv"));
                var found = false;

                for (var index = 0; index < pro.length; index++) {
                    var element = pro[index];
                    if (element.id == this.currentProduct.id) {
                        element.qty = parseInt(this.qtyProduct, 10);
                        element.list_price = this.PriceProduct;
                        found = true;
                    }
                }

                if (!found) {
                    pro.push(this.currentProduct);
                }

                localStorage.setItem("productsInv", JSON.stringify(pro));
                pro = null;

                this.barcode = '';
                this.nameProduct = '';
                this.qtyProduct = '';
                this.PriceProduct = '';
                this.enabledQty = false;
                this.editQty = false;

                Vue.nextTick(function() {
                    $("#barcode").focus();
                    $("#name").focus();
                    $("#barcode").focus();
                    this.currentProduct = null;
                });

            }
        },
        exitQty: function() {
            this.edit = true;
            this.Nproduct = {};

            this.barcode = '';
            this.nameProduct = '';
            this.qtyProduct = '';
            this.PriceProduct = '';
            this.currentProduct = null;
            this.enabledQty = false;
            this.editQty = false;
            Vue.nextTick(function() {
                $("#barcode").focus();
                $("#name").focus();
                $("#barcode").focus();
            });
        },
        updateQty: function() {
            if (this.enabledQty) {
                $("#barcode").focus();
                $("#name").focus();
                $("#qty").focus();
                $("#price").focus();
                this.editQty = true;
            }
        },
        setProduct: function(data) {
            this.barcode = data.barcode;
            this.nameProduct = data.product;

            Vue.nextTick(function() {
                $("#barcode").focus();
                $("#name").focus();
            });
        },
        newInventory: function() {
            var self = this;
            $.post("/new_inventary", { products: localStorage.getItem("productsInv") }, function(data) {

            });
        }        
    },
    computed: {
        productFilter: function() {
            var self = this;
            var products = this.products.filter(function(product) {
                if (!product.barcode) {
                    product.barcode = '';
                }
                return product.barcode.toLowerCase()
                    .indexOf(self.barcode.toLowerCase()) >= 0 &&
                    product.product.toLowerCase()
                    .indexOf(self.nameProduct.toLowerCase()) >= 0;
            });

            if (products.length == 1) {
                self.enabledQty = true;
            } else {
                self.enabledQty = false;
            }

            if (products.length == 1 && self.editQty) {
                self.productSelected = true;

                Vue.nextTick(function() {
                    self.currentProduct = products[0];
                    $("#barcode").focus();
                    $("#name").focus();
                    $("#qty").focus();
                });

                self.barcode = products[0].barcode;
                self.nameProduct = products[0].product;
                self.qtyProduct = products[0].qty || '';
                self.PriceProduct = products[0].list_price || '';

            } else {
                self.productSelected = false;
            }
            return products;
        }
    }
});


//$('body').on('keypress',this.hotkey_handler)