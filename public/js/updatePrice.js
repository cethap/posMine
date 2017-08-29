var app = new Vue({
    el: '#app',
    data: {
        products: '',
    },
    mounted: function() {

    },
    methods: {
        UpdateProducts: function() {
            var self = this;
            console.log(self.products)
            $.post("/actualizar_precios", { products: self.products }, function(data) {

            });
        },
        CreateProducts: function() {
            var self = this;
            console.log(self.products)
            $.post("/crear_productos_masivos", { products: self.products }, function(data) {

            });
        },
        addToInventory: function() {
            var self = this;
            console.log(self.products)
            $.post("/agregar_inventario", { products: self.products }, function(data) {

            });
        },
    }
});


//$('body').on('keypress',this.hotkey_handler)