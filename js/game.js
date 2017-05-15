var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


var clear = function() {
    //ctx.fillStyle = "#4e6628";
    ctx.fillStyle = "#4e6628";
    var img = document.getElementById("grass");
    //var pat = ctx.createPattern(img, "repeat");
    //ctx.fillStyle = pat;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function keys() {
    if (marked[up]) {
        car.sendKey(up);
    } else if (marked[down]) {
        car.sendKey(down);
    } 
    if (marked[right]) {
        car.sendKey(right);
    } else if (marked[left]) {
        car.sendKey(left);
    }
}

var updateCamera = function() {
    var yoff = -200;
    var rot = car.rot - Math.PI / 2;
    rot = rot - Math.floor(rot / (2 * Math.PI)) * 2 * Math.PI;
    if (rot < 0) rot += 2 * Math.PI;
    if (rot < Math.PI) {
        yoff *= -1;
    }
    var f = marked[up] ? 2 : 2;
    //camera.x += (car.x - camera.x) / f;
    camera.y += (car.y + yoff - camera.y) / f;
}
var cars = document.getElementsByClassName('car');
var car = new Car(0, 0, false, cars[0]);

var carlist = [car];

var paused = 0;

window.addEventListener('keydown', function() {
    //paused = !paused;
});

function genRandomCars() {
    //first remove very far cars
    var remove = [];
    var n = carlist.length;
    for (var i = 0; i < n; ++i) {
        remove.push(0);
    }
    console.log(n);
    for (var i = 1; i < n; ++i) {
        var dy = Math.abs(carlist[i].y - car.y);
        if (dy > camera.height * 4 || (carlist[i].destroyed && carlist[i].alpha < 0.05)) {
            remove[i] = 1;
        }
    }

    var nc = [car];
    for (var i = 1; i < n; ++i) {
        if (remove[i]) continue;
        nc.push(carlist[i]);
    }
    carlist = nc;

    //generate new cars
    var mx_on_track = 10;
    var new_cars = Math.max(0, mx_on_track - nc.length - 1);
    var dir = above ? -1 : 1;
    //console.log(new_cars);
    var range = 200;
    while (new_cars--) {
        var above = Math.random() <= 0.5;
        var idx = Math.floor(Math.random() * cars.length);
        var c = new Car(0, 0, true, cars[idx]);
        var scale = above ? 2 : 1;
        var dir = above ? -1 : 1;
        while (1) {
            c.x = Math.random() * road_w - road_w / 2;
            c.y = car.y + dir * (camera.height + Math.random() * scale * camera.height + 100);
            var ok = 1;
            for (var i = 0; i < carlist.length && ok; ++i) {
                var dx = carlist[i].x - c.x;
                var dy = carlist[i].y - c.y;
                var d = dx * dx + dy * dy;
                if (d < range * range) ok = 0;
            }
            if (ok) break;
        }
        carlist.push(c);
    }
    //console.log("cars " + carlist.length);
}

function upd() {
    if (paused) return ;
    keys();
    genRandomCars();
    for (var i = 0; i < carlist.length; ++i) {
        if (carlist[i].ai == false) continue;
        carlist[i].sendKey(up);
    }

    for (var i = 0; i < carlist.length; ++i) {
        carlist[i].update();
    }
    for (var i = 0; i < carlist.length; ++i) {
        if (carlist[i].destroyed) continue;
        for (var j = i + 1; j < carlist.length; ++j) {
            if (carlist[j].destroyed) continue;
            var r1 = carlist[i].getRect();
            var r2 = carlist[j].getRect();
            var d = checkColl(r1, r2);
            if (d[0] == 0) continue;
            var r = [r1, r2];
            var cent = [];
            for (var l = 0; l < 2; ++l) {
                var sx = 0, sy = 0;
                for (var k = 0; k < r[l].length; ++k) {
                    sx += r[l][k].x;
                    sy += r[l][k].y;
                }
                sx /= r[l].length;
                sy /= r[l].length;
                cent.push({x:sx, y:sy});
            }
            var dx = cent[0].x - cent[1].x;
            var dy = cent[0].y - cent[1].y;
            var dir = dx * d[2].x + dy * d[2].y;
            if (dir < 0) {
                d[2].x *= -1;
                d[2].y *= -1;
            }
            d[1] /= 2;
            carlist[i].x += d[1] * d[2].x;
            carlist[i].y += d[1] * d[2].y;
            carlist[j].x -= d[1] * d[2].x;
            carlist[j].y -= d[1] * d[2].y;
            var fi = carlist[i].ai == false ? 0.99 : 0.98;
            var fj = carlist[j].ai == false ? 0.99 : 0.98;
            var a = carlist[i], b = carlist[j];
            if (a.ai) a = b;
            var avel = Math.abs(a.vel);
            var ok = a.ai == false && avel > Math.abs(b.vel);
            carlist[i].vel *= fi;
            carlist[j].vel *= fj;
            carlist[i].health *= fi;
            carlist[j].health *= fj;
            if (carlist[i].health < 0.05) {
                carlist[i].destroy();
            }
            if (carlist[j].health < 0.05) {
                carlist[j].destroy();
            }
            var time = Date.now();
            carlist[i].last_collision = time;
            carlist[j].last_collision = time;
            if (ok) {
                car.score += avel < 1 ? 1 : Math.floor(avel);
                if (b.destroyed) car.score += 1000; //destroy bonus
            }
        }
    }
    if (car.destroyed) {
        document.getElementById('game_over').style.opacity = 1;
    }
    updateCamera();
    //render
    clear();
    drawScene();
    for (var i = 0; i < carlist.length; ++i) {
        carlist[i].draw();
    }
    ctx.font = "30px Monospace";
    ctx.fillText("Score: " + car.score, 25, 50);
}

setInterval(upd, 20);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.width = canvas.width;
    camera.height = canvas.height;
}

window.addEventListener('resize', resize);

resize();

document.getElementById('btn').onclick = function() {
    car.init();
    document.getElementById('game_over').style.opacity = 0;
};
