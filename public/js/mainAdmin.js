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
        edit: false,
        searchflag: true,
        Nproduct: {},
        enableSendButton: true
    },
    mounted: function() {
        this.getProducts();
        $("#barcode").focus();
        if (!localStorage.getItem("productsNews")) {
            localStorage.setItem("productsNews", '[]');
        }
    },
    methods: {
        getProducts: function() {
            var self = this;
            $.get("/productsLite", function(data) {
                self.products = data;
                var pro = JSON.parse(localStorage.getItem("productsNews"));

                for (var i = 0; i < self.products.length; i++) {
                    var e = self.products[i];
                    if(e.pos_categ_id){
                        e.category = e.pos_categ_id[1];
                    }
                    var search = true;
                    for (var y = 0; search && y < pro.length; y++) {
                        if(!pro[y].id){
                            self.products.push(pro[y]);
                            pro.splice(y, 1);
                        }
                        if(pro.length-1 > i){
                            if (pro[y].id == e.id) {
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
            var pro = JSON.parse(localStorage.getItem("productsNews"));

            function findProduct(product, index) { 
                if(product){
                    if(product.product === el[0].product){
                        pro.splice(index,1);
                    }
                }
            }
            
            pro.find(findProduct)
            localStorage.setItem("productsNews", JSON.stringify(pro));
        },
        setNewMode: function(){
            this.edit = false;
            this.searchflag = false;
            this.Nproduct.qty = '0';
            this.Nproduct.list_price = '0';
            Vue.nextTick(function() {
                $("#barcodeN").focus();
            });            
        },
        addproduct: function() {
            if(this.Nproduct.product.length > 0 && (this.Nproduct.list_price+'').length > 0){
                this.edit = false;
                this.searchflag = true;
                var pro = JSON.parse(localStorage.getItem("productsNews"));
                pro.push(JSON.parse(JSON.stringify(this.Nproduct)));
                localStorage.setItem("productsNews", JSON.stringify(pro));
                pro = null;
                this.products.push(JSON.parse(JSON.stringify(this.Nproduct)));
                this.Nproduct = {};
            }else{
                alert("Debe llenar almenos nombre, cantidad y precio")
            }
        },
        serQty: function() {

            this.currentProduct.list_price = this.PriceProduct;
            this.currentProduct.product = this.nameProduct;
            this.currentProduct.barcode = this.barcode;
            
            var pro = JSON.parse(localStorage.getItem("productsNews"));
            var found = false;

            for (var index = 0; index < pro.length; index++) {
                var element = pro[index];
                if (element.id == this.currentProduct.id) {
                    element.list_price = this.PriceProduct;
                    element.product = this.nameProduct;
                    element.barcode = this.barcode;
                    found = true;
                }
            }

            if (!found) {
                pro.push(this.currentProduct);
            }

            localStorage.setItem("productsNews", JSON.stringify(pro));
            pro = null;

            this.barcode = '';
            this.nameProduct = '';
            this.qtyProduct = '';
            this.PriceProduct = '';
            this.enabledQty = false;
            this.editQty = false;
            this.edit = false;
            this.searchflag = true;

            Vue.nextTick(function() {
                $("#barcode").focus();
                $("#name").focus();
                $("#barcode").focus();
                this.currentProduct = null;
            });

        },
        exitQty: function() {
            this.edit = false;
            this.searchflag = true;
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
                $("#price").focus();
                this.edit = true;
                this.searchflag = false;
                this.editQty = true;
            }
        },
        setProduct: function(data) {
            this.barcode = data.barcode;
            this.nameProduct = data.product;
            this.PriceProduct = data.list_price;
            this.currentProduct = data;
            this.edit = true;
            this.searchflag = false;
            var self = this;
            Vue.nextTick(function() {
                $("#barcode").focus();
                $("#name").focus();
                $("#price").focus();
                self.updateQty();
            });
        },
        newInventory: function() {
            var self = this;
            this.enableSendButton = false;
            $.post("/change_products", { products: localStorage.getItem("productsNews") }, function(data) {
                localStorage.removeItem("productsNews");
                location.reload();
            });
        }        
    },
    computed: {
        productFilter: function() {
            var self = this;
            var products = this.products.filter(function(product) {
                if(self.edit) return false;
                if (!product.barcode) {
                    product.barcode = '';
                }
                if (!product.product) {
                    return false;
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
                    $("#price").focus();
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
