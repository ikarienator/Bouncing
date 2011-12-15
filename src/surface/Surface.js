
/**
 * @class Surface
 */
function Surface(element, width, height, type) {
    if (!this instanceof Surface) {
        return new Surface(element, width, height, type);
    }
    this.sprites = {};
    this.device = Surface.createDevice(element, width, height, type || 'canvas');
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

Surface.createDevice = function (element, width, height, type) {
    switch(type.toLowerCase()) {
    case 'html':
        return new HtmlDevice(element, width, height);
    case 'canvas':
    default:
        return new Canvas(element, width, height);
    }
    
}
