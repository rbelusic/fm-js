/**
* Text translation DM class.
* 
* @class FM.DmTranslation
* @extends FM.DmObject
* @memberOf FM
* @param {object} attrs list of attribute name and values
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
        
FM.DmTranslation.prototype.getDataID = function() {
    return this.getAttr("text",'');
}

FM.DmObject.addSubClassType('Translation',FM.DmTranslation,'GLOBAL');
