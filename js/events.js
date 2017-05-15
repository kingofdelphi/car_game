var up = 38, right = 39;
var down = 40;
var left = 37;

var marked = [];
for (var i = 0; i < 256; ++i) {
    marked[i] = 0;
}

window.addEventListener('keyup', function(e) {
    marked[e.keyCode] = 0;
});

window.addEventListener('keydown', function(e) {
    marked[e.keyCode] = 1;
});


