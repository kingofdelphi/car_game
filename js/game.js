var canvas=document.getElementById("canvas");
var ctx=canvas.getContext("2d");

var f = 1.0;
var camera = {x : 0, y : 0, width : canvas.width / f, height:canvas.height / f};

function setPos(obj_id, left, top) {
    var tyre = document.getElementById(obj_id);
    tyre.style.left = left + "px";
    tyre.style.top = top + "px";
}

function toCam(x, y) {
    return {x: x + canvas.width / 2 - camera.x, y:y + canvas.height / 2 - camera.y};
}

function drawRotated(degrees, image, x, y, w, h){
    var p = toCam(x, y);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(degrees * Math.PI / 180.0);
    ctx.drawImage(image, -w / 2, -h / 2, w, h);
    ctx.restore();
}

function Car() {
    this.wheel_rot = 0;
    this.rot = 0;
    this.x = 0;
    this.y = 0;
    this.len = 40;
    this.bodylen = 120;
    this.wheel_radius = 20;
    this.vel = 0;
    var self = this;

    var drawScene = function() {
        var w = 40, h = 450, xpadd = 250, ypadd = 250;
        var lanes = 3;
        for (var j = 0; j < lanes; ++j) {
            var xp = j * (w + xpadd) - (lanes * w + (lanes - 1) * xpadd)  / 2;
            for (var i = -500; i < 500; ++i) {
                var y = -i * h - i * ypadd;
                var d = toCam(xp, y);
                ctx.fillStyle = "white";
                ctx.fillRect(d.x, d.y, w, h);
            }
        }
    }

    this.draw = function() {
        var radius = 5;
        var px1 = this.x + this.len * Math.cos(this.rot);
        var py1 = this.y + this.len * Math.sin(this.rot);
        var rot2 = this.rot - Math.PI;
        var px2 = this.x + this.len * Math.cos(rot2);
        var py2 = this.y + this.len * Math.sin(rot2);
        var ang = this.rot + Math.PI / 2;
        var bx = this.x + this.bodylen * Math.cos(ang);
        var by = this.y + this.bodylen * Math.sin(ang);
        var rearx1 = bx + this.len * Math.cos(this.rot);
        var reary1 = by + this.len * Math.sin(this.rot);
        var rearx2 = bx + this.len * Math.cos(rot2);
        var reary2 = by + this.len * Math.sin(rot2);

        //draw wheels
        //front wheel
        var mang = this.rot + this.wheel_rot - Math.PI / 2;
        var l = this.wheel_radius;
        var fw_x1 = px1 + l * Math.cos(mang);
        var fw_y1 = py1 + l * Math.sin(mang);
        var fw_x2 = px1 + l * Math.cos(mang + Math.PI);
        var fw_y2 = py1 + l * Math.sin(mang + Math.PI);

        var fw_x1 = px2 + l * Math.cos(mang);
        var fw_y1 = py2 + l * Math.sin(mang);
        var fw_x2 = px2 + l * Math.cos(mang + Math.PI);
        var fw_y2 = py2 + l * Math.sin(mang + Math.PI);

        var tyre1 = document.getElementById('tyre1');
        var tyre2 = document.getElementById('tyre2');
        var tyre3 = document.getElementById('tyre3');
        var tyre4 = document.getElementById('tyre4');
        var car = document.getElementById('car');

        var wrot = Math.floor((this.rot + this.wheel_rot) * 180.0 / Math.PI);
        var brot = Math.floor(this.rot * 180.0 / Math.PI);
        var h = 100 / 2;
        var w = 100 / 2;
        drawScene();
        drawRotated(wrot, tyre1, px1, py1, 50, 50);
        drawRotated(wrot, tyre2, px2, py2, 50, 50);
        drawRotated(brot, tyre3, rearx1, reary1, 50, 50);
        drawRotated(brot, tyre4, rearx2, reary2, 50, 50);
        var carh = 100;
        var carw = 200;
        var x = this.x - carh / 2;
        var rx = this.x;
        var ry = this.y;
        var y = this.y - carw / 2;

        //setPos('car', (this.x + bx) / 2 - carw / 2, (this.y + by) / 2 - carh / 2);

        var car_rot = brot + 90;
        car.style.webkitTransform="rotate(" + car_rot + "deg)";

        drawRotated(car_rot, car, (this.x + bx) / 2, (this.y + by) / 2, 200, 100);

        //ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
        //ctx.fillRect(canvas.width / 2 - camera.width / 2, canvas.height / 2 - camera.height / 2, camera.width, camera.height);
    }

    var updateCamera = function() {
        var yoff = -100;
        //camera.x += (self.x - camera.x) / 5;
        camera.y += (self.y + yoff - camera.y) / 5;
    }

    this.update = function() {
        var ang = this.wheel_rot + this.rot - Math.PI / 2;
        var rot_dec = 0.02;
        if (this.wheel_rot <= -rot_dec) {
            this.wheel_rot += rot_dec;
        } else if (this.wheel_rot >= rot_dec) {
            this.wheel_rot -= rot_dec;
        } else this.wheel_rot = 0;
        var u = Math.cos(ang), v = Math.sin(ang);
        this.x += u * this.vel;
        this.y += v * this.vel;
        var dec = 0.02;
        if (this.vel <= -dec) {
            this.vel += dec;
        } else if (this.vel >= dec) {
            this.vel -= dec;
        } else this.vel = 0;
        var mag = Math.min(5, Math.abs(this.vel));
        if (this.vel < 0) mag *= -1;
        this.rot += mag * this.wheel_rot / 100;
        this.draw();

        updateCamera();
    }
}

var car = new Car();
var car2 = new Car();

car.draw();
car2.draw();

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


var clear = function() {
    ctx.fillStyle = "silver";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function keys() {
    var mxvel = 15;
    if (marked[up]) {
        car.vel += 0.1;
        car.vel = Math.min(car.vel, mxvel);
    } else if (marked[down]) {
        car.vel -= 0.1;
        car.vel = Math.max(car.vel, -mxvel);
    } 
    var mx = 0.2;
    var wheel_change = 0.03;
    if (marked[right]) {
        car.wheel_rot += wheel_change;
        car.wheel_rot = Math.min(car.wheel_rot, mx);
    } else if (marked[left]) {
        car.wheel_rot -= wheel_change;
        car.wheel_rot = Math.max(car.wheel_rot, -mx);
    }
}

function upd() {
    keys();
    clear();
    car.update();
}

setInterval(upd, 20);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);

resize();

