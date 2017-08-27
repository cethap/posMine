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
                        if (pro[y].id == e.id) {
                            e.qty = pro[y].qty;
                            e.list_price = pro[y].list_price;
                            pro.splice(y, 1);
                            search = false;
                        }
                    }
                }

                pro = null;
            });
        },
        addproduct: function() {
            this.edit = true;
            var pro = JSON.parse(localStorage.getItem("productsInv"));
            pro.push(this.Nproduct);
            localStorage.setItem("productsInv", JSON.stringify(pro));
            pro = null;
            this.products.push(JSON.parse(JSON.stringify(this.Nproduct)));
            this.Nproduct = {};
        },
        serQty: function() {
            if (this.productSelected && this.qtyProduct.length > 1) {

                this.currentProduct.qty = parseInt(this.qtyProduct, 10);

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
                this.editQty = true;
            }
        },
        setProduct: function(data) {
            this.barcode = data.barcode;
            this.nameProduct = data.product;
            $("#barcode").focus();
            $("#name").focus();
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