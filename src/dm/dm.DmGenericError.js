/**
* Generic error DM class.
* 
* @class FM.DmGenericError
* @extends FM.DmObject
* @memberOf FM
* @param {object} attrs list of supported attribute names and values:
* @param attrs.messageId Error id.
* @param attrs.text Error message.
* 
* 
*/
FM.DmGenericError = FM.defineClass('DmGenericError',FM.DmObject);

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
