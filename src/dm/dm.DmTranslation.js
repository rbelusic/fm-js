/**
* Text translation DM class.
* 
* @class FM.DmTranslation
* @extends FM.DmObject
* @memberOf FM
* @param {object} attrs list of attribute name and values
*/    

FM.DmTranslation = function() {
    this._init.apply(this, arguments); 
}
FM.extendClass(FM.DmTranslation, FM.DmObject); 
FM.DmTranslation.className = "DmTranslation";

// methods
FM.DmTranslation.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        text: '',
        translation: ''
    });
    this.objectSubClass = "Translation";
}
        
FM.DmTranslation.prototype.getDataID = function() {
    return this.getAttr("text",'');
}

FM.DmObject.addSubClassType('Translation',FM.DmTranslation,'GLOBAL');
