/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
* Generic value DM class.
* 
* @class FM.DmGenericValue
* @extends FM.DmObject
* @memberOf FM
* @param {object} attrs list of attribute name and values.
* @param {string} attrs.value Value attribute.
*/    

FM.DmGenericValue = FM.defineClass('DmGenericValue',FM.DmObject);

// methods
FM.DmGenericValue.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        value: ""
    });
    this.objectSubClass = "GenericValue";
}
        
/**
 * Returns data ID of data model. 
 * 
 * @public     
 * @function 
 * @returns {string} 
 */
FM.DmGenericValue.prototype.getDataID = function() {
    return this.getID();
}

FM.DmObject.addSubClassType('GenericValue',FM.DmGenericValue,'GLOBAL');
