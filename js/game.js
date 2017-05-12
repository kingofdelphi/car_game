var canvas=document.getElementById("canvas");
var ctx=canvas.getContext("2d");

var w = 20, h = 450, xpadd = 250, ypadd = 250;
var lanes = 3;
var low = -500, high = 500;
var road_w = lanes * xpadd;
var road_h = (high - low) * (h + ypadd);

var drawScene = function() {
    var ok = toCam(-road_w / 2, -road_h / 2);
    ctx.fillStyle = "#575757";
    ctx.fillRect(ok.x, ok.y, road_w, road_h);

    for (var j = 1; j < lanes; ++j) {
        var xp = j * xpadd - road_w / 2 - w / 2;
        for (var i = low; i <= high; ++i) {
            var y = i * h + i * ypadd;
            var d = toCam(xp, y);
            ctx.fillStyle = "white";
            ctx.fillRect(d.x, d.y, w, h);
        }
    }
}

var f = 1.0;

var camera = {x : 0, y : 0, width : canvas.width / f, height:canvas.height / f};

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

function Car(x = 0, y = 0) {
    this.wheel_rot = 0;
    this.rot = 0;
    this.x = x;
    this.y = y;
    this.len = 28;
    var carh = 80;
    var carw = 140;
    this.bodylen = carw - 70;
    this.wheel_radius = 10;
    this.vel = 0;
    var wheel_h = 40;
    var wheel_w = 50;
    var self = this;

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
        drawRotated(wrot, tyre1, px1, py1, wheel_w, wheel_h);
        drawRotated(wrot, tyre2, px2, py2, wheel_w, wheel_h);
        drawRotated(brot, tyre3, rearx1, reary1, wheel_w, wheel_h);
        drawRotated(brot, tyre4, rearx2, reary2, wheel_w, wheel_h);
        var x = this.x - carh / 2;
        var rx = this.x;
        var ry = this.y;
        var y = this.y - carw / 2;

        //setPos('car', (this.x + bx) / 2 - carw / 2, (this.y + by) / 2 - carh / 2);

        var car_rot = brot + 90;
        car.style.webkitTransform="rotate(" + car_rot + "deg)";

        drawRotated(car_rot, car, (this.x + bx) / 2, (this.y + by) / 2, carw, carh);

        //ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
        //ctx.fillRect(canvas.width / 2 - camera.width / 2, canvas.height / 2 - camera.height / 2, camera.width, camera.height);
        drawBounds();
    }

    var rotate = function(obj, angle) {
        var cs = Math.cos(angle);
        var si = Math.sin(angle);
        return {x : obj.x * cs - obj.y * si, y: si * obj.x + cs * obj.y};
    }

    var drawBounds = function() {
        var pts = self.getRect();
        for (var i = 0; i < pts.length; ++i) {
            pts[i] = toCam(pts[i].x, pts[i].y);
        }
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (var i = 1; i < pts.length; ++i) {
            ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.lineTo(pts[0].x, pts[0].y);
        ctx.stroke();
    }

    this.getRect = function() {
        var wt = carw / 2;
        var ht = carh / 2;
        var pts = [
            {x: -wt, y:-ht},
            {x: wt, y:-ht},
            {x: wt, y:ht},
            {x: -wt, y:ht},
        ];

        var bx = self.x + self.bodylen * Math.cos(self.rot + Math.PI / 2);
        var by = self.y + self.bodylen * Math.sin(self.rot + Math.PI / 2);
        for (var i = 0; i < pts.length; ++i) {
            pts[i] = rotate(pts[i], self.rot + Math.PI / 2);
            pts[i].x += (self.x + bx) / 2;
            pts[i].y += (self.y + by) / 2;
        }
        return pts;
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
        var pts = this.getRect();
        var lb = 0, ub = 0;
        for (var i = 0; i < pts.length; ++i) {
            if (pts[i].x < -road_w / 2) {
                lb = Math.max(lb, -road_w / 2 - pts[i].x);
            }
            if (pts[i].x > road_w / 2) {
                ub = Math.max(ub, pts[i].x - road_w / 2);
            }
        }
        if (lb != 0) {
            this.x += lb;
            this.vel *= -0.35;
        }

        if (ub != 0) {
            this.x -= ub;
            this.vel *= -0.35;
        }
    }
}

var car = new Car();
var car2 = new Car(150, -120);
var car3 = new Car(-150, -120);

//var car2 = new Car(-250, 550);

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
    ctx.fillStyle = "#4e6628";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function keys() {
    var mxvel = 25;
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

var updateCamera = function() {
    var yoff = -100;
    //camera.x += (car.x - camera.x) / 5;
    camera.y += (car.y + yoff - camera.y) / 5;
}

var carlist = [car, car2, car3];

var paused = 0;

window.addEventListener('keydown', function() {
    //paused = !paused;
});

function upd() {
    if (paused) return ;
    keys();
    for (var i = 0; i < carlist.length; ++i) {
        //if (i) carlist[i].vel = 10;
        if (i) carlist[i].vel = 1;
        carlist[i].update();
    }
    for (var i = 0; i < carlist.length; ++i) {
        for (var j = i + 1; j < carlist.length; ++j) {
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
            console.log(d[1]);
            carlist[i].x += d[1] * d[2].x;
            carlist[i].y += d[1] * d[2].y;
            carlist[j].x -= d[1] * d[2].x;
            carlist[j].y -= d[1] * d[2].y;
        }
    }
    updateCamera();
    //render
    clear();
    drawScene();
    for (var i = 0; i < carlist.length; ++i) {
        carlist[i].draw();
    }
}

setInterval(upd, 20);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);

resize();

function dot(a, b) {
    return a.x * b.x + a.y * b.y;
}

function project(poly, axis) {
    var minp = dot(poly[0], axis);
    var maxp = minp;
    for (var i = 1; i < poly.length; ++i) {
        var prj = dot(poly[i], axis);
        minp = Math.min(minp, prj);
        maxp = Math.max(maxp, prj);
    }
    return {left:minp, right:maxp};
}

function checkColl(poly_a, poly_b) {
    var overlap, mtv_axis;
    var found = 0;
    var polys = [poly_a, poly_b];
    for (var j = 0; j < polys.length; ++j) {
        var cp = polys[j];
        for (var i = 1; i <= cp.length; ++i) {
            var cur = i < cp.length ? i : 0;
            var dx = cp[cur].x - cp[i - 1].x;
            var dy = cp[cur].y - cp[i - 1].y;
            var mg = Math.sqrt(dx * dx + dy * dy);
            if (mg == 0) mg = 1;
            dx /= mg;
            dy /= mg;
            var axis = {x:dy, y:-dx};
            var pa = project(poly_a, axis);
            var pb = project(poly_b, axis);
            if (pa.right < pb.left || pa.left > pb.right) return [0];
            var lft = Math.max(pa.left, pb.left);
            var rgt = Math.min(pa.right, pb.right);
            del = rgt - lft;
            console.log(del);
            if (!found || del < overlap) {
                mtv_axis = axis;
                found = 1;
                overlap = del;
            }
        }
    }
    return [1, overlap, mtv_axis];
}
