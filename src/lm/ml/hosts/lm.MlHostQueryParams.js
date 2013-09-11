/**
 * ML query parameters host class. 
 * 
 * @class FM.MlHostQueryParams
 * @extends FM.MlHost
 * @param {FM.AppObject} app application object
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
 */
FM.MlHostQueryParams = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(FM.MlHostQueryParams, FM.MlHost);

FM.MlHostQueryParams.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="HostQueryParams";
}

FM.MlHostQueryParams.prototype.run = function() {
    this._super("run");                
    this.setDmObject(new FM.DmObject(null,FM.getArgs()));
}

FM.MlHostQueryParams.className = "MlHostQueryParams";
FM.MlHostQueryParams.fullClassName = 'lm.MlHostQueryParams';

FM.MlHost.addHost("QueryParams",FM.MlHostQueryParams,'GLOBAL');
