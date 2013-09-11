/**
* ML list of values edit extensions class. 
* 
* @class FM.MlListOfValues
* @extends FM.MlExtension
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/
FM.MlListOfValues = function() {
    this._init.apply(this, arguments); 
}
FM.extendClass(FM.MlListOfValues,FM.MlExtension);

FM.MlListOfValues.prototype._init = function(attrs,node) {
    this._super("_init",attrs,node);
    this.objectSubClass = "MlListOfValues";
    this.lastLovArguments = null;
    this.lovDependsOf = null;
    this.lovItemsTemplate = null;
}


/*
 * data-fmml-list               - dm list conf
 * data-fmml-list-id-attr       - list attr which correspond to attr of observer
 * data-fmml-list-id            - menu id attr
 * data-fmml-list-text-attr     - menu text attr
 * data-fmml-list-def-selected  - menu def value
 * data-fmml-list-def-selected-attr -
 * data-fmml-list-allow-null    - add empty row in menu
 * data-fmml-list-depends-of    - list of host attributes to send
 */

// methods
// fetch values for LOV from server
FM.MlListOfValues.prototype.lovFetch = function(args,callback) {
    console.log("Get LOV values START ... : " + this.getAttr('data-fmml-list',''));
    
    // get observer
    var obs = this.getObserver();
    if(!obs) {
        console.log("Get LOV values START ... : obs not found - " + this.getAttr('data-fmml-list',''));
        return false;
    }
    
    // create dmlist
    args = FM.isset(args) && args && FM.isObject(args) ? args : {};
    callback = FM.isset(callback) && callback && FM.isFunction(callback) ? callback: function() {};
    var dmconfName = obs.getAttr('data-fmml-list','');
    var dmList = new FM.DmList(args,dmconfName,obs.getApp());
    this.lastLovArguments = args;
    
    // prepare listener
    var me = this;
    var lstnr = {
        /** @ignore */
        onListStart: function(sender,data) {
            console.log("Get LOV values onListStart : " + me.getAttr('data-fmml-list',''));
            $(me.getNode()).addClass("fmmlWaitState");
            return true;
        },
        /** @ignore */
        onListEnd: function(sender,data) {
            console.log("Get LOV values onListEnd : " + me.getAttr('data-fmml-list',''));
            $(me.getNode()).removeClass("fmmlWaitState");
            dmList.removeListener(lstnr);    
            callback(true,dmList);
            dmList.dispose();
            return true;
        },
        /** @ignore */
        onListError: function(sender,data) {
            console.log("Get LOV values onListError : " + me.getAttr('data-fmml-list',''));
            $(me.getNode()).removeClass("fmmlWaitState");
            dmList.removeListener(lstnr);    
            callback(false,null);
            dmList.dispose();
            return true;
        }
    };
    
    dmList.addListener(lstnr);
    dmList.getData();
    console.log("Get LOV values START ok : " + this.getAttr('data-fmml-list',''));
    return true; 
}


FM.MlListOfValues.prototype.lovRenderItem = function(obj,issel,menuId,menuAttr,menuTempl,menuTemplName) {
    var itmText = '';
    var me = this;
    if(menuTemplName != '') {
        if(me.lovItemsTemplate == null) {
            FM.UtTemplate.getTemplate(this.getApp(),obj.getAttr(),menuTemplName,function(isok,templ) {            
                if(isok) {
                    me.lovItemsTemplate = templ;
                } else {
                    me.lovItemsTemplate = '';
                }
                var attrs = obj.getAttr();
                attrs['lovSelected'] = issel ? 'selected' : '';
                attrs['lovValue'] = obj.getAttr(menuId,'');
                itmText = FM.applyTemplate(attrs, me.lovItemsTemplate, false, false);
                $(me.getNode()).append(itmText);  
            });   
            return;
        } else {
            var attrs = obj.getAttr();
            attrs['lovSelected'] = issel ? 'selected' : '';
            attrs['lovValue'] = obj.getAttr(menuId,'');
            
            itmText = FM.applyTemplate(attrs, this.lovItemsTemplate, false, false);
        }
    
    } else if(menuTempl != '') {
        itmText = 
            '<option ' + 
            (issel ? 'selected="selected"' : '') + 
            ' value="' + obj.getAttr(menuId,'') + '">' +
            FM.applyTemplate(obj.getAttr(), menuTempl, false, false) +
            '</option>'
        ;
    } else {
        itmText = 
            '<option ' + 
            (issel ? 'selected="selected"' : '') + 
            ' value="' + obj.getAttr(menuId,'') + '">' +
            obj.getAttr(menuAttr,'') +
            '</option>'
        ;
    }

    $(this.getNode()).append(itmText);        
}

FM.MlListOfValues.prototype.lovDisplay = function(isok, dmList) {    
    console.log("lovDisplay ... : " + this.getAttr('data-fmml-list',''));
    
    // clear list
    $(this.getNode()).empty();
    
    // get observer & dmobject & obs attribute name
    var me = this;
    var obs = this.getObserver();
    var dmobj = this.getDmObject();
    var attr = obs.getAttr('data-fmml-attr-name','');
    
    // LOV def data-fmml-list-id-attr > data-fmml-attr-name ref!
    var menuId = obs.getAttr('data-fmml-list-id-attr','id');
    var menuAttr = obs.getAttr('data-fmml-list-text-attr','');        
    var menuTempl = obs.getAttr('data-fmml-list-text-template','');        
    var menuTemplName = obs.getAttr('data-fmml-list-text-template-name','');        
    var defSelValue = obs.getAttr('data-fmml-list-def-selected','');
    if(FM.isFunction(window[defSelValue])) defSelValue = window[defSelValue](); // ref!
    var defSelAttr = obs.getAttr('data-fmml-list-def-selected-attr','');
    var allowNulls = obs.getAttr('data-fmml-list-allow-null','false');

    // state
    var def=null,first = null,cur=null;    
    var curVal = dmobj ? dmobj.getAttr(attr,'') : '';
    
    // ok, display list
    if(isok) {
        // null
        if(allowNulls == 'true') {
            $(thisgetNode()).append('<option value=""></option>');
        }

        // iterate list and find sel value
        dmList.forEachListElement(function(index,obj) {
            // def
            if(defSelAttr != '' && defSelValue!='') {
                if(obj.getAttr(defSelAttr,'') == defSelValue) {
                    def = obj;
                }
            }
            if(!first) {
                first = obj;
            }
            if(obj.getAttr(menuId,'') == curVal) {
                cur = obj;
            }
            return(true);
        });
        
        // find selected (current > def > first > none
        var lovSelected = cur ? cur : (def ? def : first);

        // fill list
        dmList.forEachListElement(function(index,obj) {
            me.lovRenderItem(obj,obj == lovSelected,menuId,menuAttr,menuTempl,menuTemplName);
            return(true);
        });
        
        // start listener
        $(me.getNode()).change(function() {
            var dmobj = obs.getDmObject();
            var value = $(me.getNode()).val();
            if(FM.isset(attr) && attr && attr != '' && dmobj && dmobj.getAttr(attr) !== value) {
                dmobj.setAttr(attr,value,true);
            }
        });        
        // check if dm value and lov value are the same                
        if(lovSelected) {
            if(dmobj && dmobj.getAttr(attr,'') != lovSelected.getAttr(menuId,'')) {
                dmobj.setAttr(attr,lovSelected.getAttr(menuId,''),true);            
            }
        }
           
    } else { // error
        $(me.getNode()).append('<option value=""><i>Error occured</i></option>');        
    }    
}

FM.MlListOfValues.prototype.lovGetFetchArguments = function() {
    var args = {};
    var obs = this.getObserver();    
    var dmobj = obs.getDmObject();
    if(dmobj) for(var i = 0; i < this.lovDependsOf.length; i++) {
        args[this.lovDependsOf[i]] = dmobj.getAttr(this.lovDependsOf[i],'');
    }    
    return args;    
}


FM.MlListOfValues.prototype.lovCheckDepedOfChanged = function() {    
    var obs = this.getObserver();    
    var dmobj = obs.getDmObject();

    // menu is not filled yet
    if(!dmobj || this.lastLovArguments == null) return true;
    
    
    // check attributes
    var depchanged = false;
    for(var i = 0; i < this.lovDependsOf.length; i++) {
        if(
            FM.getAttr(this.lastLovArguments,this.lovDependsOf[i],'') 
            != 
            dmobj.getAttr(this.lovDependsOf[i],'')
            ) {
            depchanged = true;
            break;
        }
    }
    
    // end
    return(depchanged);
}


FM.MlListOfValues.prototype.run = function(obs) {
    this._super("run",obs);
    
    // if dependsof attrs are not jet collected 
    var dependsOfStr = obs.getAttr('data-fmml-list-depends-of','');
    this.lovDependsOf = dependsOfStr == '' ? [] : dependsOfStr.split(',');

    // create LOV
    var me = this;
    this.lovFetch(this.lovGetFetchArguments(), function(isok, list) {
        me.lovDisplay(isok, list);
    });
}


FM.MlListOfValues.prototype.dispose = function(obs) {
    if(this.getNode()) $(this.getNode()).unbind();
    this._super("dispose");
}

FM.MlListOfValues.prototype.update = function(obs) {
    this._super("update",obs);

    // if dep value are not changed
    if(!this.lovCheckDepedOfChanged()) {
        return true;
    }
    
    var me = this;
    this.lovFetch(this.lovGetFetchArguments(), function(isok, list) {
        me.lovDisplay(isok, list);
    });
}


// static
FM.MlListOfValues.className = "MlListOfValues";
FM.MlListOfValues.fullClassName = 'gui.MlListOfValues';

FM.MlExtension.addExtensionType('MlListOfValues', FM.MlListOfValues);




