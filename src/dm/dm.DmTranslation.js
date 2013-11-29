/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
* Text translation DM class.
* 
* @class FM.DmTranslation
* @extends FM.DmObject
* @memberOf FM
* @param {object} attrs list of attribute name and values
* @param {string} attrs.text Original text.
* @param {string} attrs.translation Text translation.
*/    

FM.DmTranslation = FM.defineClass('DmTranslation',FM.DmObject);

// methods
FM.DmTranslation.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        text: '',
        translation: ''
    });
    this.objectSubClass = "Translation";
}

/**
 * Returns data ID of data model (<i>text</i> attribute value). 
 * 
 * @public     
 * @function 
 * @returns {string} 
 */
FM.DmTranslation.prototype.getDataID = function() {
    return this.getAttr("text",'');
}

FM.DmObject.addSubClassType('Translation',FM.DmTranslation,'GLOBAL');
