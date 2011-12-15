
/**
 * 
 * @param object
 * @param overrides
 */
Object['chain'] = function (object, overrides) {
    var result = Object.create(object);
    if (overrides) {
        for (var name in overrides) {
            result[name] = overrides[name];
        }
    }
    return result;
}

/**
 *
 * @param parent
 * @param overrides
 */
Object['extend'] = function (parent, overrides) {
    var klass = overrides.hasOwnProperty('constructor') ? overrides.constructor : (function () { 
        parent.apply(this, arguments);
    });
    klass.prototype = new parent();
    delete overrides.constructor;
          
    for (var name in overrides) {
        klass.prototype[name] = overrides[name];
    }
    
    return klass;
}

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
window['Matrix3'] = Matrix3;
/**
 * @class Attributes
 * @constructor
 * @param config {Object}
 */
function Attributes(config) {
    this.shadow = Object.chain(this.shadow);
    this.matrix = new Matrix3();
    if (config) this.apply(config);
}

Attributes.prototype = {
    fill : '#000',
    stroke : '#000',
    thickness : 1,
    opacity : 1,
    zIndex : 0,
    shadow : {
        on : false,
        color : '#000',
        dx : 5,
        dy : 5,
        blur : 5,
        opacity : 0.3
    },
    apply : function (config){
        for (var key in config) {
            if (key === 'shadow'){
                for (var shadowKey in config.shadow) {
                    if (shadowKey in this.shadow) {
                        this.shadow[shadowKey] = config.shadow[shadowKey];
                    }
                }
            } else if (key in this) {
                this[key] = config[key]
            }
        }
    }
};

/**
 * @class Sprite
 * @constructor
 */
function Sprite (config) {
    this.attr = new Attributes(config);
}

Sprite.prototype = {
    connect : function (device) {
        //this.pathId =device.aquirePath();
    },
    render : function () {
        throw 'abstract';
    }
};

/**
 * @class RectSprite
 * @constructor
 * @extends {Sprite}
 */
function RectSprite (config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 10;
    this.height = config.height || 10;
    Sprite.apply(this, [config]);
}

RectSprite.prototype = {
    connect : function (device) {
        this.targetId = device.aquirePath();
    },
    update : function (device, targets) {
        var me = this,
            path = targets[this.targetId],
            attrs = this.attr;
        path.setAttributes(attrs);
        path.setPath(['M', me.x, me.y, 'l', me.width, 0, 'l', 0, me.height, 'l', -me.width, 0, 'z']);
    }
};

/**
 * @class EllipseSprite
 * @constructor
 * @extends {Sprite}
 */

EllipseSprite = Object.extend(Sprite, {
    constructor : function (config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.width = config.width || 10;
        this.height = config.height || 10;
        Sprite.apply(this, [config]);
    },
    
    connect : function (device) {
        this.targetId = device.aquirePath();
    },
    
    update : function (device, targets) {
        var me = this,
            path = targets[this.targetId],
            attrs = this.attr,
            halfWidth = this.width * 0.5,
            halfHeight = this.height * 0.5,
            cx = this.x + halfWidth,
            cy = this.y + halfHeight,
            kappa = 0.5522847498307933984;
        path.setAttributes(attrs);
        debugger;
        path.setPath(
            [
                'M', cx, cy - halfHeight,
                'C', cx + kappa * halfWidth, cy - halfHeight, cx + halfWidth + cy - kappa * halfHeight, cx + halfWidth, cy,
                'S', cx + kappa * halfWidth, cy + halfHeight, cx, cy + halfHeight,
                'S', cx - halfWidth, cy + kappa * halfHeight, cx - halfWidth, cy,
                'S', cx - kappa * halfWidth, cy - halfHeight, cx, cy -halfHeight,
                'z'
            ]
        );
    }
});

/**
 * @class ImageSprite
 * @constructor
 * @extends {Sprite}
 */
function ImageSprite (config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.radius = config.radius || 10;
    Sprite.apply(this, [config]);
}

ImageSprite.prototype = {
    connect : function (device) {
        this.targetId = device.aquireCircle();
    },
    update : function (device, targets) {
        var me = this,
            circle = targets[this.targetId],
            attrs = this.attr,
            radius = this.radius;
        circle.setAttributes(attrs);
        circle.setPosition(this.x, this.y);
        circle.setRadius(this.radius);
    }
};

/**
 * @class TextSprite
 * @constructor
 * @extends {Sprite}
 */
function TextSprite (config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.text = config.text || '';
    this.font = config.font || 'Arial';
    this.size = config.size || 10;
    this.unit = config.unit || 'px';
    Sprite.apply(this, [config]);
}

TextSprite.prototype = {
    connect : function (device) {
        this.targetId = device.aquireText();
    },
    update : function (device, targets) {
        var me = this,
            target = targets[this.targetId],
            attrs = this.attr;
        target.setAttributes(attrs);
        target.setFont(this.font);
        target.setSize(this.size);
        target.setUnit(this.unit);
        target.setPosition(this.x, this.y);
        target.setText(this.text);
    }
};

(function (global) {
    /**
     * @class Canvas
     * @constructor
     * @param element {HTMLElement}
     * @param width   {Number}
     * @param height  {Number}
     */
    function Canvas (element, width, height) {
        this.currentAquiringContext = null;
        this.targets = {};
        this.aquiringTargets = null;
        var canvas = this.canvas = document.createElement('canvas');
        element.appendChild(canvas);
        canvas.width = width;
        canvas.height = height;
        canvas.innerHTML = 'Fallback content, in case the browser does not support Canvas.';
        this.ctx = canvas.getContext('2d');
    }
    
    /**
     * @class Target
     * @constructor
     */
    var Target = function () {
        this.attr = new Attributes();
    }
    
    Target.prototype.setAttributes = function (attr) {
        this.attr.apply(attr);
    }

    /**
     * @class FillStrokeTarget
     * @constructor
     */
    var FillStrokeTarget = Object.extend(Target, {
        
        drawPath : function () {
            throw 'abstract';
        },
        
        render : function (ctx, shadowOnly) {
            var attr = this.attr;
            ctx.beginPath();
            this.drawPath(ctx);
            ctx.closePath();
            ctx.fill();
            if (!shadowOnly) {
                ctx.stroke();
            }
        }
    });
    
    /**
     * @class PathTarget
     * @constructor
     */
    var PathTarget = Object.extend(FillStrokeTarget, {
        constructor: function () {
            FillStrokeTarget.apply(this, arguments);
            this.path = [];
        },
        
        drawPath: function (ctx) {
            var path = this.path,
                  len = path.length,
                  last = [0, 0], start = last,
                  c1, c2;
            for (var i = 0; i < len; i++) {
                switch (path[i]) {
                    case 'M':
                        start = last = [path[++i], path[++i]];
                        ctx.moveTo(last[0], last[1]);
                        break;
                    case 'm':
                        start = last = [last[0] + path[++i], last[1] + path[++i]];
                        ctx.moveTo(last[0], last[1]);
                        break;
                    case 'L':
                        last = [path[++i], path[++i]];
                        ctx.lineTo(last[0], last[1]);
                        break;
                    case 'l':
                        last = [last[0] + path[++i], last[1] + path[++i]];
                        ctx.lineTo(last[0], last[1]);
                        break;
                    case 'C':
                        c1 = [path[++i], path[++i]];
                        c2 = [path[++i], path[++i]];
                        last = [path[++i], path[++i]];
                        ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], last[0], last[1]);
                        break;
                    case 'c':
                        c1 = [last[0] + path[++i], last[1] + path[++i]];
                        c2 = [last[0] + path[++i], last[1] + path[++i]];
                        last = [last[0] + path[++i], last[1] + path[++i]];
                        ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], last[0], last[1]);
                        break;
                    case 'S':
                        c1 = [last[0] * 2 - c1[0], last[1] * 2 - c1[1]];
                        c2 = [path[++i], path[++i]];
                        last = [path[++i], path[++i]];
                        ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], last[0], last[1]);
                        break;
                    case 'Z':
                    case 'z':
                        ctx.closePath();
                }
            }
        },

        setPath : function (list) {
            this.path = list;
        }
    });
   
    /**
     * @class CircleTarget
     * @constructor
     */
    var CircleTarget = Object.extend(FillStrokeTarget, {
        setPosition : function (x, y) {
            this.x = x;
            this.y = y;
        },
        setRadius : function (radius) {
            this.radius = radius;
        },

        drawPath : function (ctx) {
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        }
    });
        
    
    
    Canvas.prototype = {
        strict : false,
        
        setSize: function (width, height) {
            this.canvas.width = width;
            this.canvas.height = height;
        },
        
        startAquiringContext: function (id) {
            if (this.currentAquiringContext === null) {
                this.currentAquiringContext = id;
                this.aquiringTargets = this.targets[id] = (this.targets[id] || []);
            }
        },
        
        stopAquiringContext: function () {
            this.currentAquiringContext = null;
            this.aquiringTargets = null;
        },
        
        aquirePath: function () {
            var id = this.aquiringTargets.length;
            this.aquiringTargets[this.aquiringTargets.length] = new PathTarget();
            return id;
        },
        
        aquireCircle: function () {
            var id = this.aquiringTargets.length;
            this.aquiringTargets[this.aquiringTargets.length] = new CircleTarget();
            return id;
        },
        
        getTargets: function (id) {
            return this.targets[id];
        },
        
        renderZStrip : function (ctx, list) { 
            for (var i = 0; i < list.length; i++) {
                var target = list[i], attr = target.attr, 
                    shadow = attr.shadow;
                
                ctx.fillStyle = attr.fill;
                ctx.strokeStyle = attr.stroke;
                ctx.lineWidth = attr.thickness;
                    
                if (shadow.on) {
                    ctx.shadowColor = shadow.color;
                    ctx.shadowOffsetX = shadow.dx;
                    ctx.shadowOffsetY = shadow.dy;
                    ctx.shadowBlur = shadow.blur;
                    
                    ctx.globalAlpha = attr.opacity * shadow.opacity; // op * sh * dst + (1 - op * sh) * src
                    target.render(ctx, true);
                    
                    ctx.shadowColor = 'none';
                    ctx.globalAlpha = (1 - shadow.opacity) / (1 - shadow.opacity * attr.opacity) * attr.opacity;
                }
                
                target.render(ctx, false);
            }
        },
        
        renderZStripStrict: function (ctx, list) {
            // drawShadow
            for (var i = 0; i < list.length; i++) {
                var target = list[i], attr = target.attr, 
                    shadow = attr.shadow;
                if (shadow.on) {
                    ctx.shadowColor = shadow.color;
                    ctx.shadowOffsetX = shadow.dx;
                    ctx.shadowOffsetY = shadow.dy;
                    ctx.shadowBlur = shadow.blur;
                    ctx.fillStyle = attr.fill;
                    ctx.globalAlpha = attr.opacity * shadow.opacity; // op * sh * dst + (1 - op * sh) * src
                    target.render(ctx, true);
                }
            }
            ctx.shadowColor = 'none';
            for (var i = 0; i < list.length; i++) {
                var target = list[i], attr = target.attr;
                ctx.fillStyle = attr.fill;
                ctx.strokeStyle = attr.stroke;
                ctx.lineWidth = attr.thickness;
                if (shadow.on) {
                    ctx.globalAlpha = (1 - shadow.opacity) / (1 - shadow.opacity * attr.opacity) * attr.opacity;
                } else {
                    ctx.globalAlpha = attr.opacity;
                }
                target.render(ctx, false);
            }
        },
        
        render: function () {
            var targets = this.targets,
                zlist = {}, zs, ctx = this.ctx,
                renderStrip = this.strict ? this.renderZStripStrict : this.renderZStrip;
            for (var id in targets) {
                var context = this.targets[id];
                for (var i = 0; i < context.length; i++) {
                    var target = context[i], zIndex = +target.attr.zIndex;
                    if (!zlist[zIndex]) {
                        zlist[zIndex] = [];
                    }
                    zlist[zIndex].push(target);
                }
            }
            zs = Object.keys(zlist).sort();
            ctx.lineJoin = 'miter';
            for (var zi = 0; zi < zs.length ; zi++) {
                var z = zs[zi];
                ctx.save();
                
                var list = zlist[z];
                renderStrip(ctx, list);
                ctx.restore();
            }
        }
    };
    
    // Export
    global.Canvas = Canvas;
})(this);


/**
 * @class Surface
 */
function Surface(element, width, height) {
    if (!this instanceof Surface) {
        return new Surface(element, width, height);
    }
    this.sprites = {};
    this.device = Surface.createDevice(element, width, height);
    this.currentId = 1;
}

Surface.prototype = {
    setSize: function (width, height) {
        this.device.setSize(width, height);
    },

    add : function (type, config) {
        if (!config && typeof type !== 'string') {
            config = type;
            type = config.type;
        }
        var sprite = this['create' + type[0].toUpperCase() + type.substr(1).toLowerCase()](config);
        // NOTE: will not reuse id.
        sprite.id = 'sprite-' + this.currentId++;
        this.sprites[sprite.id] = sprite;
        this.device.startAquiringContext(sprite.id);
        sprite.connect(this.device);
        this.device.stopAquiringContext();
    },
    
    get : function (sprite) {
        if (typeof sprite === 'string') {
            return this.sprites[sprite];
        } else if (sprite instanceof Sprite) {
            return sprite;
        } else {
            return undefined;
        }
    },
    
    remote : function (sprite) {
        if (typeof sprite === 'string') {
            sprite = this.sprites[sprite];
        }
        if (sprite) {
            sprite.destroy();
            delete this.sprites[sprite.id];
        }
    },
    
    createText : function (config) {
        return new TextSprite(config);
    },
    
    createRect : function (config) {
        return new RectSprite(config);
    },

    createEllipse : function (config) {
        return new EllipseSprite(config);
    },

    createPath : function (config) {
        return new PathSprite(config);
    },
    
    createImage : function (config) {
        return new ImageSprite(config);
    },
    
    render : function () {
        var sprites = this.sprites;
        for (var key in sprites) {
            this.updateSprite(sprites[key]);
        }
        this.device.render();
    },
    
    updateSprite : function (sprite) {
        sprite.update(this.device, this.device.getTargets(sprite.id));
    },
    
    destroy : function () {
        
    }
};

Surface.createDevice = function (element, width, height) {
    return new Canvas(element, width, height);
}

