/**
* HTTP request query parameters host class. 
* 
* @class FM.MlHostQueryParams
* @memberOf FM
* @extends FM.MlHost
* @param {FM.AppObject} app application object
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/
FM.MlHostQueryParams = FM.defineClass('MlHostQueryParams',FM.MlHost);

FM.MlHostQueryParams.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="QueryParams";
}

FM.MlHostQueryParams.prototype.run = function() {
    this._super("run");                
    this.setDmObject(new FM.DmObject(FM.getArgs()));
}



FM.MlHost.addHost("QueryParams",FM.MlHostQueryParams,'GLOBAL');
