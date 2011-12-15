/**
 * 
 * @param object
 * @param overrides
 */
Object['chain'] = function (object, overrides) {
    var result = Object.create(object);
    if (overrides) {
        for (var name in overrides) {
            result[name] = overrides[name];
        }
    }
    return result;
}

/**
 *
 * @param parent
 * @param overrides
 */
Object['extend'] = function (parent, overrides) {
    var klass = overrides.hasOwnProperty('constructor') ? overrides.constructor : (function () { 
        parent.apply(this, arguments);
    });
    klass.prototype = new parent();
    delete overrides.constructor;
          
    for (var name in overrides) {
        klass.prototype[name] = overrides[name];
    }
    
    return klass;
}
