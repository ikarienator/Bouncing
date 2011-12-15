    /**
     * @class HtmlDevice
     * @constructor
     * @param element {HTMLElement}
     * @param width   {Number}
     * @param height  {Number}
     */
    function HtmlDevice (element, width, height) {
        this.currentAquiringContext = null;
        this.targets = {};
        this.aquiringTargets = null;
        var container = this.container = document.createElement('div');
        element.appendChild(container);
        container.style.width = width + 'px';
        container.style.height = height + 'px';
        container.style.padding = '0';
        container.style.margin = '0';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
    }
    
    /**
     * @class Target
     * @constructor
     */
    var Target = function (container) {
        this.attr = new Attributes();
        if (!container) return;
        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.boxSizing = 'border-box';
        container.appendChild(this.element);
    }
    
    Target.prototype = {
        setAttributes :function (attr) {
            this.attr = attr;
        },
        render: function () {
            var attr = this.attr, style = this.element.style;
            style.zIndex = attr.zIndex * 10;
            style.opacity = attr.opacity;
            if (attr.shadow.on) {
                style.boxShadow = attr.shadow.dx + 'px ' +
                    attr.shadow.dy + 'px ' + attr.shadow.blur + 'px 0px ' + 
                    attr.shadow.color.applyOpacity(attr.shadow.opacity);
            } else {
                style.boxShadow = 'none';
            }
        },
        destroy : function () {
            if (this.element) {
                this.element.parentNode.removeChild(this.element);
            }
        }
    };
    
    /**
     * @class FillStrokeTarget
     * @constructor
     */
    var FillStrokeTarget = Object.extend(Target, {
        drawPath : function () {
            throw 'abstract';
        },
        
        render : function () {
            var attr = this.attr, style = this.element.style;
            Target.prototype.render.apply(this, arguments);
            this.drawPath();
            style.borderStyle = 'solid';
            style.borderColor = attr.stroke;
            style.borderWidth = attr.thickness + 'px';
            style.background = attr.fill.toString();
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
            throw 'not implemented';
        },

        setPath : function (list) {
            this.path = list;
        }
    });
   
    /**
     * @class CircleTarget
     * @constructor
     */
    var EllipseTarget = Object.extend(FillStrokeTarget, {
        setPosition : function (x, y, width, height) {
            var me = this;
            me.x = x;
            me.y = y;
            me.width = width;
            me.height = height;
        },

        drawPath : function () {
            var me = this,
                attr = this.attr,
                style = me.element.style;
            style.left = me.x - attr.thickness * 0.5 + 'px';
            style.top = me.y - attr.thickness * 0.5 +  'px';
            style.width = me.width + attr.thickness +  'px';
            style.height = me.height + attr.thickness + 'px';
            style.borderRadius = me.width * 0.5 + attr.thickness * 0.5 + 'px / ' + (me.height * 0.5 + attr.thickness * 0.5) + 'px';
        }
    });
    
    /**
     * @class CircleTarget
     * @constructor
     */
    var RectTarget = Object.extend(FillStrokeTarget, {
        setPosition : function (x, y, width, height) {
            var me = this;
            me.x = x;
            me.y = y;
            me.width = width;
            me.height = height;
        },

        drawPath : function () {
            var me = this,
                attr = this.attr,
                style = me.element.style;
            style.left = me.x - attr.thickness * 0.5 + 'px';
            style.top = me.y - attr.thickness * 0.5 + 'px';
            style.width = me.width + attr.thickness + 'px';
            style.height = me.height + attr.thickness + 'px';
        }
    });
    
    HtmlDevice.prototype = {
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
            this.aquiringTargets[this.aquiringTargets.length] = new PathTarget(this.container);
            return id;
        },
        
        aquireEllipse: function () {
            var id = this.aquiringTargets.length;
            this.aquiringTargets[this.aquiringTargets.length] = new EllipseTarget(this.container);
            return id;
        },
        
        aquireRect: function () {
            var id = this.aquiringTargets.length;
            this.aquiringTargets[this.aquiringTargets.length] = new RectTarget(this.container);
            return id;
        },
        
        getTargets: function (id) {
            return this.targets[id];
        },
        
        render: function () {
            var targets = this.targets;
            for (var id in targets) {
                var context = this.targets[id];
                for (var i = 0; i < context.length; i++) {
                    var target = context[i];
                    target.render();
                }
            }
        },
        
        destroy: function () {
            // Hard clean.
            this.container.innerHTML = '';
            this.container.parentNode.removeChild(this.container);
        }
    };
    
    // Export
    window.HtmlDevice = HtmlDevice;
