function Bezier3(a, b, c, d) {
    this.cachedRange = null;
    Object.defineProperties(this, {
        a: {
            get: function () {
                return a;
            },
            set: function (value) {
                if (a === value) return;
                this.cachedRange = null;
                a = value;
            }
        },
        b: {
            get: function () {
                return b;
            },
            set: function (value) {
                if (b === value) return;
                this.cachedRange = null;
                b = value;
            }
        },
        c: {
            get: function () {
                return c;
            },
            set: function (value) {
                if (c === value) return;
                this.cachedRange = null;
                c = value;
            }
        },
        d: {
            get: function () {
                return d;
            },
            set: function (value) {
                if (d === value) return;
                this.cachedRange = null;
                d = value;
            }
        }
    });
}

Bezier3.prototype = {
    get : function (x) {
        if (x === 0) return this.a;
        if (x === 1) return this.d;
        var a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            du = 1 - x,
            d3 = du * du * du,
            r = x / du;
        return d3 * (a + r * (3 * b + r * (3 * c + d * r)));
    },
    range: function () {
        if (this.cachedRange) {
            return this.cachedRange;
        }
        var a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            points = [], r;
        // The min and max happens on boundary or b' == 0
        if (a + 3 * c == d + 3 * b) {   
            r = a - b;
            r /= 2 * (a - b - b + c);
            if ( r < 1 && r > 0) {
                points.push(r);
            }
        } else {
            // b'(x) / -3 = (a-3b+3c-d)x^2+ (-2a+4b-2c)x + (a-b)
            // delta = -4 (-b^2+a c+b c-c^2-a d+b d)
            var A = a - 3 * b + 3 * c - d,
                top = 2 * (a - b - b + c),
                C = a - b,
                delta = top * top - 4 * A * C,
                bottom = A + A, s;
            if (delta === 0) {
                r = top / bottom;
                if (r < 1 && r > 0) {
                    points.push(r);
                }
            } else if (delta > 0) {
                s = Math.sqrt(delta);
                r = (s + top) / bottom;
                
                if (r < 1 && r > 0) {
                    points.push(r);
                }
                
                r = (top - s) / bottom;
                
                if (r < 1 && r > 0) {
                    points.push(r);
                }
            }
        }
        var min = Math.min(a, d), max = Math.max(a, d);
        for (var i = 0; i < points.length; i++) {
            min = Math.min(min, this.get(points[i]));
            max = Math.max(max, this.get(points[i]));
        }
        return this.cachedRange = [min, max];
    },
    left: function(split) {
        var a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            ds = 1 - split,
            dps = ds / split;
        return new Bezier3(
            a,
            split * (dps * a + b),
            split * split * (dps * dps * a + 2 * dps * b + c),
            split * split * split * (dps * (dps * (dps * a + 3 * b) + 3 * c) + d)
        );
    },
    right: function(split) {
        var a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            ds = (1 - split),
            dps = split / ds;
        return new Bezier3(
            ds * ds * ds * (dps * (dps * (dps * d + 3 * c) + 3 * b) + a),
            ds * ds * (dps * (dps * d + c + c) + b),
            ds * (dps * d + c),
            d
        );
    }
}

function plotB(element, left, top, width, height, bezier, color) {
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    canvas.style.left = left + 'px';
    canvas.style.top = top + 'px';
    
    element.appendChild(canvas);
    ctx.beginPath();
    ctx.moveTo(0, height - bezier.get(0) * height);
    for (var i = 0; i <= 100; i ++) {
        var r = i / 100, x = r * width,
            y = bezier.get(r) * height;
        ctx.lineTo(x, height - y);
    }
    ctx.strokeStyle = color || '#000';
    ctx.lineWidth = color ? 2 : 1;
    ctx.stroke();
}

function BezierCurve (x1, y1, x2, y2, x3, y3, x4, y4) {
    this.x = new Bezier3(x1, x2, x3, x4);
    this.y = new Bezier3(y1, y2, y3, y4);
}


BezierCurve.prototype = {
    plot: function (canvas, width, height, color) {
        var width = canvas.width,
            height = canvas.height,
            ctx = canvas.getContext('2d'),
            x = this.x, y = this.y;
        ctx.beginPath();
        ctx.moveTo(x.a * width, height - y.a * height);
        ctx.bezierCurveTo(x.b * width, (1 - y.b) * height, x.c * width, (1 - y.c) * height, x.d * width, (1 - y.d) * height);
        ctx.strokeStyle = 'red'; 
        ctx.lineWidth = 2;
        ctx.stroke();
        
        r = 0;
        ctx.moveTo(x.get(r) * width, height - y.get(r) * height);
        for (var i = 1; i <= 5; i ++) {
            var r = i / 30;
            ctx.lineTo(x.get(r) * width, height - y.get(r) * height);
        }
        ctx.strokeStyle = color || '#000';
        ctx.lineWidth = color ? 2 : 1;
        ctx.stroke();
    },
    
    bbox: function () {
        var rx = this.x.range(), ry = this.y.range();
        return {
            x: rx[0],
            y: ry[0],
            width : rx[1] - rx[0],
            height : ry[1] - ry[0]
        }; 
    }
}