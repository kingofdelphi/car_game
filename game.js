function Car() {
    this.wheel_rot = 0;
    this.rot = 0;
    this.x = this.y = 300;
    this.len = 40;
    this.bodylen = 120;
    this.wheel_radius = 20;
    this.accln = 0;
    this.vel = 0;

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
        $('#tyre1').css({left:px1 - w / 2, top:py1 - h / 2});
        $('#tyre2').css({left:px2 - w / 2, top:py2 - h / 2});
        $('#tyre3').css({left:rearx1 - w / 2, top:reary1 - h / 2});
        $('#tyre4').css({left:rearx2 - w / 2, top:reary2 - h / 2});
        tyre1.style.webkitTransform="rotate(" + wrot + "deg)";
        tyre2.style.webkitTransform="rotate(" + wrot + "deg)";
        tyre3.style.webkitTransform="rotate(" + brot + "deg)";
        tyre4.style.webkitTransform="rotate(" + brot + "deg)";
        tyre4.style.webkitTransform="rotate(" + brot + "deg)";
        var carh = 100;
        var carw = 200;
        var x = this.x - carh / 2;
        var rx = this.x;
        var ry = this.y;
        var y = this.y - carw / 2;

        $('#car').css({left:(this.x + bx) / 2 - carw / 2, top:(this.y + by) / 2 - carh / 2});
        var car_rot = brot + 90;
        car.style.webkitTransform="rotate(" + car_rot + "deg)";
        
    }

    this.update = function() {
        var ang = this.wheel_rot + this.rot - Math.PI / 2;
        var rot_dec = 0.05;
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
        var outerw = $('#outer').width();
        var outerh = $('#outer').height();
        console.log(outerw + " " + outerh);
        if (this.x < 0) {
            this.x = outerw - 1;
        }
        if (this.x >= outerw) {
            this.x = 0;
        }
        if (this.y < 0) {
            this.y = outerh - 1;
        }

        if (this.y >= outerh) {
            this.y = 0;
        }
    }
}

var car = new Car();
car.draw();
var up = 38, right = 39;
var down = 40;
var left = 37;
var marked = [];

for (var i = 0; i < 256; ++i) {
    marked[i] = 0;
}

$(document).keyup(function(e) {
    marked[e.keyCode] = 0;
});

$(document).keydown(function(e) {
    marked[e.keyCode] = 1;
});

function keys() {
    if (marked[up]) {
        car.vel += 0.1;
        car.vel = Math.min(car.vel, 20);
    } else if (marked[down]) {
        car.vel -= 0.1;
        car.vel = Math.max(car.vel, -20);
    } 
    var mx = 0.5;
    var wheel_change = 0.08;
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
    car.update();
}

setInterval(upd, 20);
