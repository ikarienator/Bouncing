var rad = Math.PI / 180, deg = 1 / rad;

function Vector3() {

}

/**
 * @class Matrix3
 * @param {number|Matrix3} [a=1] x-x scale or the all the array of the new matrix
 * @param {number} [b=0] y-x scale
 * @param {number} [c=0] x-y scale
 * @param {number} [d=1] y-y scale
 * @param {number} [e=0] x translation
 * @param {number} [f=0] y translation
 * @constructor
 */
function Matrix3(a, b, c, d, e, f) {
    if (a instanceof Matrix3) {
        this.matrix = [
            [a.matrix[0][0], a.matrix[0][1], a.matrix[0][2]],
            [a.matrix[1][0], a.matrix[1][1], a.matrix[1][2]]
        ];
    } else if (Array.isArray(a)) {
        this.matrix = [
            [a[0][0], a[0][1], a[0][2]],
            [a[1][0], a[1][1], a[1][2]]
        ];
    } else if (typeof a === 'number') {
        this.matrix = [
            [a, c, e],
            [b, d, f]
        ];
    } else {
        this.matrix = [
            [1, 0, 0],
            [0, 1, 0]
        ];
    }
    
}

Matrix3.prototype = {

    /**
     * Multiply the current matrix with the given one, and returns a new Matrix3.
     * @private
     * @param {number|Matrix3} a x-x scale or the all the array of the new matrix
     * @param {number} [b=0] y-x scale
     * @param {number} [c=0] x-y scale
     * @param {number} [d=1] y-y scale
     * @param {number} [e=0] x translation
     * @param {number} [f=0] y translation
     * @return {Array}
     */
    $mult : function(a, b, c, d, e, f) {
        var out = [ [], [], []],
            left = this.matrix,
            right = new Matrix3(a, b, c, d, e, f).matrix;

        out[0][0] = left[0][0] * right[0][0] + left[0][1] * right[1][0];
        out[1][0] = left[1][0] * right[0][0] + left[1][1] * right[1][0];
        out[2][0] = left[2][0] * right[0][0] + left[2][1] * right[1][0] + left[0][2];
        out[0][1] = left[0][0] * right[0][1] + left[0][1] * right[1][1];
        out[1][1] = left[1][0] * right[0][1] + left[1][1] * right[1][1];
        out[2][1] = left[2][0] * right[0][1] + left[2][1] * right[1][1] + left[0][2];
        out[0][2] = left[0][0] * right[0][2] + left[0][1] * right[1][2];
        out[1][2] = left[1][0] * right[0][2] + left[1][1] * right[1][2];
        out[2][2] = left[2][0] * right[0][2] + left[2][1] * right[1][2] + left[0][2];

        return out;
    },

    /**
     * @public
     * Multiply a matrix on the right-hand side
     * @param b {Matrix3}
     * @return {Matrix3}
     */
    postpend : function(b) {
        this.matrix = this.$mult(b);
        return this;
    },

    /**
     * @public
     * Multiply a matrix on the left-hand side
     * @param b {Matrix3}
     * @return {Matrix3}
     * */
    prepend : function(b) {
        this.matrix = b.$mult(this);
        return this;
    },

    /**
     * @public
     * Inverse a matrix. If can't, will generate a matrix with all NaN elements.
     * @return {Matrix3}
     */
    inverse : function() {
        var matrix = this.matrix,
              a = matrix[0][0],
              b = matrix[1][0],
              c = matrix[0][1],
              d = matrix[1][1],
              e = matrix[0][2],
              f = matrix[1][2],
              x = 1 / (a * d - b * c);
        return new Matrix3(d * x, -b * x, -c * x, a * x, (c * f - d * e) * x, (b * e - a * f) * x);
    },

    /**
     * @public
     * @param x
     * @param y
     */
    translate : function(x, y) {
        this.prepend(new Matrix3(1, 0, 0, 1, x, y));
        return this;
    },

    /**
     * @public
     * @param x
     * @param y
     * @param cx
     * @param cy
     */
    scale : function(x, y, cx, cy) {
        var me = this;
        y = y || x;
        cx = cx || 0;
        cy = cy || 0;
        me.prepend(new Matrix3(x, 0, 0, y, cx * (1 - x), cy * (1 - y)));
        return me;
    },

    /**
     * @public
     * @param rotate
     * @param cx
     * @param cy
     */
    rotate : function(rotate, cx, cy) {
        rotate *= rad;
        var me = this,
              c = Math.cos(rotate),
              s = Math.cos(rotate);
        cx = cx || 0;
        cy = cy || 0;
        me.prepend(new Matrix3(c, s, -s, c, -c * cx + cx - s * cy, s * cx - c * cy + cy));
        return me;
    },

    /**
     * @public
     * @param {number} x
     * @param {number} y
     */
    x : function(x, y) {
        var row = this.matrix[0];
        return x * row[0] + y * row[1] + row[2];
    },

    /**
     * @public
     * @param {number} x
     * @param {number} y
     */
    y : function(x, y) {
        var row = this.matrix[1];
        return x * row[0] + y * row[1] + row[2];
    },

    /**
     * @public
     * @param {CanvasContext} ctx
     */
    toCanvas : function(ctx) {
        var matrix = this.matrix;
        ctx.transform(matrix[0][0], matrix[1][0], matrix[0][1], matrix[1][1], matrix[0][2], matrix[1][2]);
    },

    /**
     * @public
     * @return {string}
     */
    toSvg : function() {
        var matrix = this.matrix;
        return "matrix(" + [matrix[0][0], matrix[1][0], matrix[0][1], matrix[1][1], matrix[0][2], matrix[1][2]].join(',') + ")";
    }
};


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
            // b'(x) = -3 (a (-1+x)^2+x (-2 c+3 c x-d x)+b (-1+4 x-3 x^2))
            // delta = -36 (-b^2+a c+b c-c^2-a d+b d)
            var ab = a - b, bc = b - c, cd = c - d,
                delta = ab * cd - bc * bc,
                top = ab + bc,
                bottom = top + bc - cd,
                s = Math.sqrt(-delta);
            if (delta === 0) {
                r = top / bottom;
                if (r < 1 && r > 0) {
                    points.push(r);
                }
            } else if (delta < 0) {
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