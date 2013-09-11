/**
* Generic value DM class.
* @class FM.DmGenericValue
* @extends FM.DmObject
* @param {object} attrs list of attribute name and values
*/    

FM.DmGenericValue = function() {
    this._init.apply(this, arguments); 
}
FM.extendClass(FM.DmGenericValue, FM.DmObject); 

// properties
FM.DmGenericValue.prototype.objectSubClass = "";

// methods
FM.DmGenericValue.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        value: ""
    });
    this.objectSubClass = "GenericValue";
}
        
FM.DmGenericValue.prototype.getDataID = function() {
    return this.getID();
}
FM.DmGenericValue.className = "DmGenericValue";
FM.DmGenericValue.fullClassName = 'dm.DmGenericValue';

FM.DmObject.addSubClassType('GenericValue',FM.DmGenericValue,'GLOBAL');
