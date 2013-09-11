/**
* ML slider input extensions class. 
* 
* @class FM.MlSlider
* @extends FM.MlExtension
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
*/
FM.MlSlider = function() {
    this._init.apply(this, arguments); // new poziva _init()
}

FM.extendClass(FM.MlSlider,FM.MlExtension); 

// properties
FM.MlSlider.prototype.objectSubClass = "";
FM.MlSlider.prototype.sliderWidget = null;
// methods
FM.MlSlider.prototype._init = function(attrs,node) {
    this._super("_init",attrs,node);
    this.objectSubClass = "MlSlider";
    this.sliderDiv = null;
    this.sliderWidget = null;
}

FM.MlSlider.prototype.run = function(obs) {
    this._super("run",obs);
    
    var me = this;
    var attr = '';
    var value = 0;
    var vmin = 0;
    var vmax = 100;
    var vstep = 1;
    var vpostfix = '';
    var vformat = '';
    var vskin = 'blue';

    // calc params
    if(obs) {
        var dmobj = obs.getDmObject();
        attr = obs.getAttr('data-fmml-attr-name','');
        if(dmobj && attr != '') {
            value = dmobj.getAttr(attr,value);
        }
        vmin = obs.getAttr('data-fmml-slider-min','');
        vmin = FM.isset(vmin) && vmin && vmin != '' ? vmin : value;
        if(vmin > value) vmin = value;
        vmax = obs.getAttr('data-fmml-slider-max','');
        vmax = FM.isset(vmax) && vmax && vmax != '' ? vmax : value;
        if(vmax < value) vmax = value;
        vstep = obs.getAttr('data-fmml-slider-step','');
        vstep = FM.isset(vstep) && vstep && vstep != '' ? vstep : 1;
        vpostfix = obs.getAttr('data-fmml-slider-postfix','');
        vpostfix = FM.isset(vpostfix) && vpostfix ? vpostfix : '';
        vformat = obs.getAttr('data-fmml-slider-format','');
        vformat = FM.isset(vformat) && vformat ? vformat : '';
        vskin = obs.getAttr('data-fmml-slider-skin','');
        vskin = FM.isset(vskin) && vskin ? vskin : 'round';            
    }

    
    var jsopts = {
        value: value,
        min: vmin, 
        max: vmax, 
        step: vstep,
        /** @ignore */
        stop: function(event, ui) {
            var value = FM.getAttr(ui,'value',0);
            var obs = me.node.fmmlObserver;
            if(obs && obs.getDmObject()) {
                var dmobj = obs.getDmObject();
                var attr = $(obs.node).attr('data-fmml-attr-name');
                if(FM.isset(attr) && attr && attr != '') {
                    dmobj.setAttr(attr,value,true);
                }
            }
            return true;                
        }
    }

    // run jq plugin
    if(!this.sliderDiv) {
        this.sliderDiv = $('<div class="fmmlSliderValue"></div>');
        $(this.sliderDiv).insertAfter(this.node);
    }
    this.sliderWidget = $(this.sliderDiv).slider(jsopts);                        
}

FM.MlSlider.prototype.dispose = function(obs) {
    this._super("dispose",obs);

    if(this.sliderDiv && this.sliderWidget) {
        $(this.sliderDiv).slider("destroy");
        $(this.sliderDiv).remove();
        this.sliderDiv = null;
        this.sliderWidget = null;
    }
}

FM.MlSlider.prototype.update = function(obs) {
    this._super("update",obs);

    var dmobj = obs && obs.getDmObject() ? obs.getDmObject() : null;
    if(dmobj && this.sliderWidget) {
        if(this.sliderDiv) {
            var attr = obs.getAttr('data-fmml-attr-name','');
            if(attr != '') {
                var value = dmobj.getAttr(attr,value);
                $(this.sliderDiv).slider("value",value);
            }
        }
    }
}

// static
FM.MlSlider.className = "MlSlider";
FM.MlSlider.fullClassName = 'gui.MlSlider';

FM.MlExtension.addExtensionType('MlSlider', FM.MlSlider);
