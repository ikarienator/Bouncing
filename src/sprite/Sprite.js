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
