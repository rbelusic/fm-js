/**
* ML waternark extensions class. 
* 
* @class FM.MlWatermark
* @extends FM.MlExtension
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
*/
FM.MlWatermark = function() {
    this._init.apply(this, arguments); // new poziva _init()
}

FM.extendClass(FM.MlWatermark,FM.MlExtension); 

// properties
FM.MlWatermark.prototype.objectSubClass = "";

// methods
FM.MlWatermark.prototype.run = function(obs) {
    this._super("run",obs);
    var attr = $(this.node).attr('data-fmml-watermark-value');

    if(this.node.nodeName == 'INPUT' || this.node.nodeName == 'TEXTAREA') {
        $(this.node).watermark(attr);
    } 
}

// static
FM.MlWatermark.className = "MlWatermark";
FM.MlWatermark.fullClassName = 'gui.MlWatermark';

FM.MlExtension.addExtensionType('MlWatermark', FM.MlWatermark);


