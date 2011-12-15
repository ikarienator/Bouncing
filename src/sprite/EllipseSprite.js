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
        this.targetId = device.aquireEllipse();
    },
    
    update : function (device, targets) {
        var me = this,
            target = targets[me.targetId],
            attrs = me.attr;
        target.setAttributes(attrs);
        target.setPosition(me.x, me.y, me.width, me.height);
    }
});
