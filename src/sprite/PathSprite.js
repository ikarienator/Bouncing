/**
 * @class PathSprite
 * @constructor
 * @extends {Sprite}
 */

PathSprite = Object.extend(Sprite, {
    constructor : function (config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.radius = config.radius || 10;
        Sprite.apply(this, [config]);
    },
    
    connect : function (device) {
        this.targetId = device.aquirePath();
    },
    
    update : function (device, targets) {
        var me = this,
            path = targets[this.targetId],
            attrs = this.attr,
            radius = this.radius;
        path.setAttributes(attrs);
        path.setPath(me.path);
    }
});
