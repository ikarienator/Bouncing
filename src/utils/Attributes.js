
function Shadow () {
    this.$color = Color.from('#000');
}

Shadow.prototype = {
    on : false,
    dx : 5,
    dy : 5,
    blur : 5,
    opacity : 0.3
};

Object.defineProperty(Shadow.prototype,
    'color', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this.$color;
        },
        set: function (value) {
            var color = Color.from(value);
            if (color && !color.equals(this.$color)){
                this.$color = color;
                this.isDirty = true;
            }
        }
    }
);



/**
 * @class Attributes
 * @constructor
 * @param config {Object}
 */
function Attributes(config) {
    Object.defineProperties(this, {
        $shadow : {
            writable: true,
            configurable: false,
            value : new Shadow()
        },
        $fill : {
            writable: true,
            configurable: false,
            value : Color.from('#000')
        },
        $stroke : {
            writable: true,
            configurable: false,
            value : Color.from('#000')
        }
    });
    this.isDirty = false;
    this.matrix = new Matrix3();
    if (config) {
        this.apply(config);
    }
}

Attributes.prototype = {
    thickness : 1,
    opacity : 1,
    zIndex : 0,
    apply : function (config){
        if (typeof config.thickness !== 'undefined') {
            this.thickness = config.thickness;
        }
        if (typeof config.thickness !== 'undefined') {
            this.opacity = config.opacity;
        }
        if (typeof config.zIndex !== 'undefined') {
            this.zIndex = config.zIndex;
        }
        if (typeof config.fill !== 'undefined') {
            this.fill = config.fill;
        }
        if (typeof config.stroke !== 'undefined') {
            this.stroke = config.stroke;
        }
        if (typeof config.shadow !== 'undefined') {
            this.shadow = config.shadow;
        }
    },
    reset : function () {
        this.isDirty = false;
    }
};

Object.defineProperty(Attributes.prototype, 'fill',  {
    enumerable: true,
    configurable: false,
    get: function () {
        return this.$fill;
    },
    set: function (value) {
        var color = Color.from(value);
        if (color && !color.equals(this.$fill)){
            this.$fill = color;
            this.isDirty = true;
        }
    }
});

Object.defineProperty(Attributes.prototype, 'stroke', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this.$stroke;
        },
        set: function (value) {
            var color = Color.from(value);
            if (color && !color.equals(this.$stroke)){
                this.$stroke = color;
                this.isDirty = true;
            }
        }
    });

Object.defineProperty(Attributes.prototype,'shadow', {
    enumerable: true,
    configurable: false,
    get : function () {
        return this.$shadow;
    },
    set : function (value) {
        var shadow = this.$shadow;
        if ('on' in value) {
            shadow.on = value.on;
        }
        if ('color' in value) {
            shadow.color = value.color;
        }
        if ('dx' in value) {
            shadow.dx = value.dx;
        }
        if ('dy' in value) {
            shadow.dy = value.dy;
        }
        if ('blur' in value) {
            shadow.blur = value.blur;
        }
        if ('opacity' in value) {
            shadow.opacity = value.opacity;
        }
    }
});

window.Attributes = Attributes;