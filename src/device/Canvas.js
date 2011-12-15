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
        this.ctx.lineJoin = 'miter';
    }
    
    /**
     * @class Target
     * @constructor
     */
    var Target = function () {
        this.attr = new Attributes();
    }
    
    Target.prototype.setAttributes = function (attr) {
        this.attr = attr;
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
            ctx.fill();
            ctx.stroke();
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
                        c1 = [last[0] * 2 - c2[0], last[1] * 2 - c2[1]];
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
     * @class EllipseTarget
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

        drawPath : function (ctx) {
            var me = this,
                t = me.attr.thickness * 0.5,
                halfWidth = me.width * 0.5,
                halfHeight = me.height * 0.5,
                cx = me.x + halfWidth,
                cy = me.y + halfHeight,
                kappa = 0.5522847498307933984;
            
            ctx.moveTo(cx, cy - halfHeight);
            ctx.bezierCurveTo(cx + kappa * halfWidth, cy - halfHeight, cx + halfWidth, cy - kappa * halfHeight, cx + halfWidth, cy);
            ctx.bezierCurveTo(cx + halfWidth, cy + kappa * halfHeight, cx + kappa * halfWidth, cy + halfHeight, cx, cy + halfHeight);
            ctx.bezierCurveTo(cx - kappa * halfWidth, cy + halfHeight, cx - halfWidth, cy + kappa * halfHeight, cx - halfWidth, cy);
            ctx.bezierCurveTo(cx - halfWidth, cy - kappa * halfHeight, cx - kappa * halfWidth, cy - halfHeight, cx, cy -halfHeight);
            ctx.closePath();
        }
    });
        
    /**
     * @class RectTarget
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

        drawPath : function (ctx) {
            var me = this,
                t = me.attr.thickness,
                x = me.x,
                y = me.y,
                width = me.width,
                height = me.height;
            
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x, y + height);
            ctx.closePath();
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
        
        aquireEllipse: function () {
            var id = this.aquiringTargets.length;
            this.aquiringTargets[this.aquiringTargets.length] = new EllipseTarget();
            return id;
        },
        
        aquireRect: function () {
            var id = this.aquiringTargets.length;
            this.aquiringTargets[this.aquiringTargets.length] = new RectTarget();
            return id;
        },
        
        getTargets: function (id) {
            return this.targets[id];
        },
        
        renderZStrip : function (ctx, list) { 
            for (var i = 0; i < list.length; i++) {
                var target = list[i], attr = target.attr, 
                    shadow = attr.shadow;
                
                ctx.fillStyle = attr.fill.toString();
                ctx.strokeStyle = attr.stroke.toString();
                ctx.lineWidth = attr.thickness;
                ctx.globalAlpha = attr.opacity;
                
                if (shadow.on) {
                    ctx.shadowColor = shadow.color.toString();
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
                    ctx.shadowColor = shadow.color.toString();
                    ctx.shadowOffsetX = shadow.dx;
                    ctx.shadowOffsetY = shadow.dy;
                    ctx.shadowBlur = shadow.blur;
                    ctx.fillStyle = attr.fill.toString();
                    ctx.globalAlpha = attr.opacity * shadow.opacity; // op * sh * dst + (1 - op * sh) * src
                    target.render(ctx, true);
                }
            }
            ctx.shadowColor = 'none';
            for (var i = 0; i < list.length; i++) {
                var target = list[i], attr = target.attr;
                ctx.fillStyle = attr.fill.toString();
                ctx.strokeStyle = attr.stroke.toString();
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
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
