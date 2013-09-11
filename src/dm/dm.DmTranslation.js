/**
* Text translation DM class.
* @class FM.DmTranslation
* @extends FM.DmObject
* @param {object} attrs list of attribute name and values
*/    

FM.DmTranslation = function() {
    this._init.apply(this, arguments); 
}
FM.extendClass(FM.DmTranslation, FM.DmObject); 

// properties
FM.DmTranslation.prototype.objectSubClass = "";

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

FM.DmTranslation.className = "DmTranslation";
FM.DmTranslation.fullClassName = 'dm.DmTranslation';

FM.DmObject.addSubClassType('Translation',FM.DmTranslation,'GLOBAL');
