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
            if (!found || del < overlap) {
                mtv_axis = axis;
                found = 1;
                overlap = del;
            }
        }
    }
    return [1, overlap, mtv_axis];
}
