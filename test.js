let a = [3000, 3000, 3000, 3000, 3000, 2000, 2000, 2000, 2000, 2000, 1000, 1000, 1000, 1000, 1000];

let gg = [];

for (i = 0; i < a.length; i++) {
    if (i == 4 || i == a.length - 1) {
        let range = a.splice(0, i + 1);
        gg.push(function() {
            return new Promise(function(rs, rj) {
                let lp = [];
                for (y = 0; y < range.length; y++) {
                    lp.push(new Promise(function(rs, rj) {
                        let dat = JSON.parse(JSON.stringify(range[y]));
                        setTimeout(function() {
                            rs(dat);
                            console.log(dat);
                        }, range[y]);
                    }))
                }
                Promise.all(lp).then(function(data) {
                    rs(data);
                    console.log("se termino", data);
                }).catch(function(data) {
                    rj(data);
                    console.log(data);
                });
            });
        });
        i = 0;
    }
}

function con(pro, arr, index) {
    if (index == arr.length) return;
    let next = index + 1;
    con(pro.then(arr[index]), arr, next);
}

con(Promise.resolve(), gg, 0);