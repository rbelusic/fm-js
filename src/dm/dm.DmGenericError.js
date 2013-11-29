/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
* Generic error DM class.
* 
* @class FM.DmGenericError
* @extends FM.DmObject
* @memberOf FM
* @param {object} attrs list of supported attribute names and values:
* @param {string} attrs.messageId Error ID.
* @param {string} attrs.text Error message.
* 
*/
FM.DmGenericError = FM.defineClass('DmGenericError',FM.DmObject);

// methods
FM.DmGenericError.prototype._init = function(attrs) {
    this._super("_init", attrs, {messageId: "0",text: "No error"});
    this.objectSubClass = "GenericError";
}

/**
 * Returns data ID of data model. 
 * 
 * @public     
 * @function 
 * @returns {string} 
 */
FM.DmGenericError.prototype.getDataID = function() {
    return this.getID();
}

/**
 * Returns <i>messageId</i> attribute value.
 * 
 * @returns {string}
 */
FM.DmGenericError.prototype.getErrorCode = function() {
    return this.getAttr('messageId','0');
}

/**
 * Set <i>messageId</i> attribute value.
 * 
 * @param {string} ec Error code.
 */
FM.DmGenericError.prototype.setErrorCode = function(ec) {
    this.setAttr('messageId',ec);
}

/**
 * Returns <i>text</i> attribute value.
 * 
 * @returns {string}
 */
FM.DmGenericError.prototype.getErrorText = function() {
    return this.getAttr('text','');
}

/**
 * Set <i>text</i> attribute value.
 * 
 * @param {string} ec Error code.
 */
FM.DmGenericError.prototype.setErrorText = function(text) {
    return this.setAttr('text',text);
}

/**
 * Check if error is occured. 
 * Object is in error state when <i>messageId</i> is not equal '0'.
 * 
 * @returns {boolean}
 */
FM.DmGenericError.prototype.isError = function() {
    var errCode = this.getErrorCode();
    
    return errCode !== '' && errCode !== '0';
}


FM.DmObject.addSubClassType('GenericError',FM.DmGenericError,'GLOBAL');
