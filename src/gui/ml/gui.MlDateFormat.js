/**
* ML date fromating extensions class. 
* 
* @class FM.MlDateFormat
* @extends FM.MlExtension
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
*/
FM.MlDateFormat = function() {
    this._init.apply(this, arguments); // new poziva _init()
}

FM.extendClass(FM.MlDateFormat,FM.MlExtension); 

// properties
FM.MlDateFormat.prototype.objectSubClass = "";

// methods
FM.MlDateFormat.prototype.run = function(obs) {
    this._super("run",obs);
    var attr = $(this.node).attr('data-fmml-date-format','');

    if(this.node.nodeName == 'INPUT' || this.node.nodeName == 'TEXTAREA') {
        $(this.node).watermark(attr);
    } 
}

// static
FM.MlDateFormat.className = "MlDateFormat";
FM.MlDateFormat.fullClassName = 'gui.MlDateFormat';

FM.MlExtension.addExtensionType('MlDateFormat', FM.MlDateFormat);


