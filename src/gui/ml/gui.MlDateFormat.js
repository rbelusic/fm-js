/**
* ML date fromating extensions class. 
* 
* @class FM.MlDateFormat
* @extends FM.MlExtension
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
*/
FM.MlDateFormat = FM.defineClass('MlDateFormat',FM.MlExtension);

// methods
FM.MlDateFormat.prototype._init = function(attrs,node) {
    this._super("_init",attrs,node);
    this.objectSubClass = "DateFormat";
}

FM.MlDateFormat.prototype.run = function(obs) {
    this._super("run",obs);
    var attr = $(this.node).attr('data-fmml-date-format','');

    if(this.node.nodeName == 'INPUT' || this.node.nodeName == 'TEXTAREA') {
        $(this.node).watermark(attr);
    } 
}

FM.MlExtension.addExtensionType('MlDateFormat', FM.MlDateFormat);


