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
    this.cornerRadius = config.cornerRadius || 0; 
    Sprite.apply(this, [config]);
}

RectSprite.prototype = {
    connect : function (device) {
        this.targetId = device.aquireRect();
    },
    update : function (device, targets) {
        var me = this,
            target = targets[me.targetId],
            attrs = me.attr;
        target.setAttributes(attrs);
        target.setPosition(me.x, me.y, me.width, me.height);
    }
};
