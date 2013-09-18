/**
* Generic error DM class.
* 
* @class FM.DmGenericError
* @extends FM.DmObject
* @memberOf FM
* @param {object} attrs list of attribute name and values
* @param {object} options list of additional attributes
* 
*/
FM.DmGenericError = function() {
    this._init.apply(this, arguments); 
}
FM.extendClass(FM.DmGenericError, FM.DmObject); 
FM.DmGenericError.className = "DmGenericError";

// methods
FM.DmGenericError.prototype._init = function(attrs) {
    this._super("_init", attrs, {messageId: "0",text: "No error"});
    this.objectSubClass = "GenericError";
}
        
FM.DmGenericError.prototype.getDataID = function() {
    return this.getID();
}

FM.DmGenericError.prototype.getErrorCode = function() {
    return this.getAttr('messageId','0');
}

FM.DmGenericError.prototype.setErrorCode = function(ec) {
    this.setAttr('messageId',ec);
}

FM.DmGenericError.prototype.getErrorText = function() {
    return this.getAttr('text','');
}

FM.DmGenericError.prototype.setErrorText = function(text) {
    return this.setAttr('text',text);
}

FM.DmGenericError.prototype.isError = function() {
    var errCode = this.getErrorCode();
    
    return errCode !== '' && errCode !== '0';
}


FM.DmObject.addSubClassType('GenericError',FM.DmGenericError,'GLOBAL');
