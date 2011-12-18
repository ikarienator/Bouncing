function Device (element, width, height) {
    
}

Device.prototype = {
    setSize: function (width, height) {
        throw 'abstract';
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
        throw 'abstract';
    },
    
    aquireEllipse: function () {
        throw 'abstract';
    },
    
    aquireRect: function () {
        throw 'abstract';
    },
    
    getTargets: function (id) {
        return this.targets[id];
    },
    
    render: function () {
        throw 'abstract';
    }
}