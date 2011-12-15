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
