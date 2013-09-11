/**
* Attribute display ML observer class. 
*
* <table>
* <th>List of ML node attributes</th>
* <tr><td>data-fmml-attr-value-visible</td><td>type of attribute (string,number,date)</td></tr>
* <tr><td>data-fmml-attr-value-hidden</td><td>set true if dates is in UTC</td></tr>
* </table>
* 
* @class FM.MlObserverDisplay
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/    
FM.MlObserverDisplay = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(FM.MlObserverDisplay, FM.MlObserver);

FM.MlObserverDisplay.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="ObserverDisplay";
}        


FM.MlObserverDisplay.prototype.evalCondition = function(dmobj,v) {
    var ok = false;
    
    // if condition is undefined
    if(!FM.isset(v) || v == '' || !v) return ok;
    
    // prop or function in dmobject
    if(dmobj && FM.isset(dmobj[v])) { 
        if(FM.isFunction(dmobj[v])) {
            ok = dmobj[v]();
        } else {
            ok = dmobj[v];
        }
    } else if(dmobj && dmobj.isAttr(v)) { // attr in dmobject
        ok = dmobj.getAttr(v,false);
    } else {
        // eval value
        ok = this.resolveAttrValue("-",v);
    }

    // end
    return FM.isset(ok) && ok != null && ok != '' && ok != false && ok != 'false';    
}

FM.MlObserverDisplay.prototype.evalCondition__old = function(dmobj,v) {
    var ok = false;
    
    if(!dmobj || !FM.isset(v) || v == '' || !v) return ok;
    
    if(dmobj && FM.isset(dmobj[v])) { // ako je fn ili prop u obj
        if(FM.isFunction(dmobj[v])) {
            ok = dmobj[v]();
        } else {
            ok = dmobj[v];
        }
    } else if(dmobj && dmobj.isAttr(v)) {
        ok = dmobj.getAttr(v,false);
    } else {
        // eval
        ok = this.resolveAttrValue("-",v);
    }

    // end
    return FM.isset(ok) && ok != null && ok != '' && ok != false;    
}

FM.MlObserverDisplay.prototype.setNodeValue = function() {
    var visible = null;
    var visibilityCheck = this.getAttr('data-fmml-attr-value-visible','');    
    if(visibilityCheck != '') {
        visible = this.evalCondition(this.getDmObject(),visibilityCheck);
    } else {
        visibilityCheck = this.getAttr('data-fmml-attr-value-hidden','');
        if(visibilityCheck != '') {
            visible = !this.evalCondition(this.getDmObject(),visibilityCheck);
        }
    }
    
    // set
    if(this.getAttr('data-fmml-attr-name','') != '') {
        var value = this.getValue();
    
        if(FM.isset(this.node.value)) {
            this.node.value = value;
        } else if(this.node.nodeName == 'IMG') {
            this.node.setAttribute("src",value);
        } else {
            this.node.innerHTML = value;
        }
    }
    
    // show & hide
    if(visible) {
        $(this.node).show();
    } else {
        $(this.node).hide();
    }
    
}

FM.MlObserverDisplay.className = "MlObserverDisplay";
FM.MlObserverDisplay.fullClassName = 'lm.MlObserverDisplay';

FM.MlObserver.addObserver("Display",FM.MlObserverDisplay,'GLOBAL');
