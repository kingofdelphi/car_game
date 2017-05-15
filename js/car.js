var w = 15, h = 450, xpadd = 250, ypadd = 250;
var lanes = 3;
var low = -500, high = 500;
var road_w = lanes * xpadd;
var road_h = (high - low) * (h + ypadd);
var f = 1.0;
var camera = {x : 0, y : 0, width : canvas.width / f, height:canvas.height / f};
var drawScene = function() {
    var ok = toCam(-road_w / 2, -road_h / 2);
    //ctx.fillStyle = "#575757";
    //ctx.fillRect(ok.x, ok.y, road_w, road_h);
    var img = document.getElementById("road");
    var pat = ctx.createPattern(img, "repeat");
    ctx.fillStyle = pat;
    ctx.translate(ok.x, ok.y);
    ctx.fillRect(0, 0, road_w, road_h);
    ctx.translate(-ok.x, -ok.y);

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

function toCam(x, y) {
    return {x: x + canvas.width / 2 - camera.x, y: y + canvas.height / 2 - camera.y};
}

function drawRotated(degrees, image, x, y, w, h, alpha = 1){
    var p = toCam(x, y);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(degrees * Math.PI / 180.0);
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, -w / 2, -h / 2, w, h);
    ctx.globalAlpha = 1;
    ctx.restore();
}

function getRandomVel() {
    return Math.random() * 50 + 15;
}

function Car(x = 0, y = 0, ai=true, car_image) {
    var carh = 80;
    var carw = 140;
    if (car_image.classList.contains('blue')) {
        carh = 110;
    }
    var wheel_h = 40;
    var wheel_w = 50;
    var self = this;
    var mxvel = ai == true ? getRandomVel() : 25;

    this.bodylen = carw - 70;
    this.x = x;
    this.y = y;
    this.len = 28;
    if (car_image.classList.contains('black')) {
        this.wheel_w = 10;
        this.len = 28;
        //carh = 110;
    }
    this.ai = ai;
    this.wheel_radius = 10;


    this.init = function() {
        this.last_collision = 0;
        this.health = 1;
        this.destroyed = false;
        this.alpha = 1.0;
        this.x = x;
        this.y = y;
        this.wheel_rot = 0;
        this.rot = 0;
        this.vel = 0;
    }

    this.init();

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

        var wrot = Math.floor((this.rot + this.wheel_rot) * 180.0 / Math.PI);
        var brot = Math.floor(this.rot * 180.0 / Math.PI);
        drawRotated(wrot, tyre1, px1, py1, wheel_w, wheel_h, this.alpha);
        drawRotated(wrot, tyre2, px2, py2, wheel_w, wheel_h, this.alpha);
        drawRotated(brot, tyre3, rearx1, reary1, wheel_w, wheel_h, this.alpha);
        drawRotated(brot, tyre4, rearx2, reary2, wheel_w, wheel_h, this.alpha);
        var x = this.x - carh / 2;
        var rx = this.x;
        var ry = this.y;
        var y = this.y - carw / 2;

        var car_rot = brot - 90;
        car_image.style.webkitTransform="rotate(" + car_rot + "deg)";

        drawRotated(car_rot, car_image, (this.x + bx) / 2, (this.y + by) / 2, carw, carh, self.alpha);

        //ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
        //ctx.fillRect(canvas.width / 2 - camera.width / 2, canvas.height / 2 - camera.height / 2, camera.width, camera.height);
        var pa = toCam(rearx1, reary1);
        var pb = toCam(rearx2, reary2);
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = "rgba(0, 0, 0, " + 0.8 * this.alpha + ")";
        ctx.stroke();
        var r = 0, g = 0, b = 0;
        if (this.health > 0.6) g = 255;
        else if (this.health > 0.2) {
            r = 255;
            g = 255;
        } else {
            r = 255;
        }
        ctx.strokeStyle = "rgba(" + r + ", " + g + ", " + b + ", " + 0.6 * this.alpha + ")";
        var dx = pb.x - pa.x, dy = pb.y - pa.y;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pa.x + this.health * dx, pa.y + this.health * dy);
        ctx.stroke();
        //drawBounds();
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
        var mag = Math.min(3, Math.abs(this.vel));
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
        var v = Math.abs(this.vel);
        var f = v <= 5 ? 1 / 1.2 : 5 / v;
        if (lb != 0) {
            this.x += lb;
            this.vel *= -0.35;
            this.health *= f;
        }

        if (ub != 0) {
            this.x -= ub;
            this.vel *= -0.35;
            this.health *= f;
        }
        healthCheck();
        if (self.destroyed) {
            self.alpha *= 0.9;
        }
    }

    var healthCheck = function() {
        if (self.destroyed) return ;
        var cur = Date.now() - self.last_collision;
        if (cur > 1000) {
            var dh = 0.001;
            self.health = Math.min(1, self.health + dh);
        }
    }

    this.sendKey = function(key) {
        if (key == up) {
            this.vel += 0.1;
            this.vel = Math.min(this.vel, mxvel);
        } else if (key == down) {
            this.vel -= 0.1;
            this.vel = Math.max(this.vel, -mxvel);
        }
        var mx = 0.5;
        var wheel_change = 0.03;
        if (key == right) {
            this.wheel_rot += wheel_change;
            this.wheel_rot = Math.min(this.wheel_rot, mx);
        } else if (key == left) {
            this.wheel_rot -= wheel_change;
            this.wheel_rot = Math.max(this.wheel_rot, -mx);
        }
    }

}
