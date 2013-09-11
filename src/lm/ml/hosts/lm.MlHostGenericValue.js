/**
 * ML generic value host class. 
 * 
 * @class FM.MlHostGenericValue
 * @extends FM.MlHost
 * @param {FM.AppObject} app application object
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
 */
FM.MlHostGenericValue = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(FM.MlHostGenericValue, FM.MlHost);

FM.MlHostGenericValue.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="HostGenericValue";
}        

FM.MlHostGenericValue.prototype.run = function(oValue) {
    this._super("run");
    this.setDmObject(FM.isset(oValue) ? oValue : new FM.DmGenericValue({}));
}                        

FM.MlHostGenericValue.className = "MlHostGenericValue";
FM.MlHostGenericValue.fullClassName = 'lm.MlHostGenericValue';

FM.MlHost.addHost("GenericValue",FM.MlHostGenericValue,'GLOBAL');

