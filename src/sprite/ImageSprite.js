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
