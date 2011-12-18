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