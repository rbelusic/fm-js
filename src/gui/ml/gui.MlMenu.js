/**
* ML menu edit extensions class. 
* 
* @class FM.MlMenu
* @extends FM.MlExtension
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/
FM.MlMenu = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.MlMenu,FM.MlExtension);

FM.MlMenu.prototype._init = function(attrs,node) {
    this._super("_init",attrs,node);
    this.objectSubClass = "MlMenu";
    this.dmlist = null;
    this.active = false;
    this.lastListArguments = null;
    this.lastListDmObject = null;
    this._initMenu();
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

FM.MlMenu.prototype.run = function(obs) {
    this._super("run",obs);
    
    var me = this;
    var _obs = obs;
        
    if(me.node != me.listNode) {
        $(_obs.node).click(function() {
            // first call
            if(!me.lastListArguments) me._createMenu(_obs);

            return true;
        });
    } else {
        me._createMenu(_obs);
    }
}

FM.MlMenu.prototype.dispose = function(obs) {
    this._disposeMenu();
    if(this.listNode) $(this.listNode).unbind();
    this._super("dispose");
    this.executed = false;
}

FM.MlMenu.prototype.update = function(obs) {
    this._super("update",obs);
    
    var dmobj = obs.getDmObject();
    var createNew = this.active;
    
    if(this._checkDepedOfChanged(obs)) {
        this._disposeMenu(obs);
    }
    
    var deps = this._checkDepedOf(obs);
    if(deps.ok && createNew) {
        this._createMenu(obs);
    }

    if(
        !deps.ok &&
        dmobj && 
        this._dependsOf && 
        this._dependsOf.length > 0
        ) {
        var attr = obs.getAttr('data-fmml-attr-name','');
        if(attr != '') dmobj.setAttr(attr,'',true);
    }
}

// private
FM.MlMenu.prototype._initMenu = function() {
    console.log("Init menu1: " + this.getAttr('data-fmml-list',''));

    if(this.dmlist != null) return;
    
    this.lastListArguments = null;
    this.lastListDmObject = null;
    
    var selectId = 'selectitem' + this.getID();
    var visibleOptions = $(this.node).attr('data-fmml-list-size');
    visibleOptions = FM.isset(visibleOptions) && visibleOptions > 1 ? visibleOptions : 1;
    
    if(this.node.nodeName != 'SELECT') {
        this.listNode = $(
            '<select id="' + selectId + '"' + 
            (visibleOptions > 1 ? 'size="' + parseInt(visibleOptions) + '" ' : '') +
            ' class="fmmlMenuExtension fmmlValueMenuInactive"></select>'
            );
        $(this.node).addClass("fmmlValueMenuActive");    
        $(this.node).after(this.listNode);
    } else {
        this.listNode = this.node;
        $(this.node).addClass("fmmlValueMenuActive");
    }
    var me = this;
    
    $(this.listNode).blur(function() {
        me._hideMenu();
        return true;
    });

    $(me.node).focus(function() {        
        me._showMenu();
        return true;
    });
    console.log("Init menu2: " + this.getAttr('data-fmml-list',''));
}

// clear options list
FM.MlMenu.prototype._disposeMenu = function() {
    console.log("Dispose menu1: " + this.getAttr('data-fmml-list',''));
    this._hideMenu();
    this.lastListArguments = null;
    this.lastListDmObject = null;
    if(this.listNode && this.listNode != this.node) {
        //        $(this.listNode).unbind();
        $(this.listNode).empty();
    //        $(this.listNode).remove();
    //        this.listNode = null;        
    }
    console.log("Dispose menu2: " + this.getAttr('data-fmml-list',''));
}

FM.MlMenu.prototype._dependsOf = null;

FM.MlMenu.prototype._checkDepedOf = function(obs) {
    var i;
    
    if(this._dependsOf == null) {
        var dependsOfStr = obs.getAttr('data-fmml-list-depends-of','');
        this._dependsOf = dependsOfStr == '' ? [] : dependsOfStr.split(',');
    }
    var listOpt =  {};
    var dmobj = obs.getDmObject();
    var depok = true;
    for(i = 0; i < this._dependsOf.length; i++) {
        listOpt[this._dependsOf[i]] = dmobj ? dmobj.getAttr(this._dependsOf[i],'') : '';
        if(listOpt[this._dependsOf[i]] == '') {
            depok = false;
        }
    }    
    return {
        ok: depok, 
        args: listOpt
    };
}

FM.MlMenu.prototype._checkDepedOfChanged = function(obs) {
    // menu is not created yet
    if(this.lastListArguments == null) return false;
    
    // if dependsof attrs are not collected 
    if(this._dependsOf == null) {
        var dependsOfStr = obs.getAttr('data-fmml-list-depends-of','');
        this._dependsOf = dependsOfStr == '' ? [] : dependsOfStr.split(',');
    }
    
    // if dmobject is changed
    var dmobj = obs.getDmObject();
    if(
        !this.lastListDmObject || 
        this.lastListDmObject != dmobj
        ) {
        return true;
    }

    // check attributes
    var i;
    var depok = false;
    for(i = 0; i < this._dependsOf.length; i++) {        
        if(
            FM.getAttr(this.lastListArguments,this._dependsOf[i],'') 
            != 
            dmobj.getAttr(this._dependsOf[i],'')
            ) {
            depok = true;
            break;
        }
    }
    
    // end
    return(depok);
}

// fill options list
FM.MlMenu.prototype._createMenu = function(obs) {
    console.log("Create menu1: " + this.getAttr('data-fmml-list',''));
    if(!obs || this.dmList) return false;
    this.dmList = 1; // hack da ne uelti tko
    var depOpt =  this._checkDepedOf(obs);
    var listOpt = depOpt.args;
    this.lastListArguments = listOpt;
    this.lastListDmObject = obs.getDmObject();
    if(!depOpt.ok) {
        console.log("Create menu1-: " + this.getAttr('data-fmml-list',''));
        this.dmList = null; // oslobodi lock
        return false;
    }
    
    var dmconfName = obs.getAttr('data-fmml-list','');
    this.dmList = new FM.DmList(listOpt,dmconfName,obs.getApp());

    var me = this;
    var _obs = obs;
     
    var lstnr = {
        /** @ignore */
        onListStart: function(sender,data) {
            console.log("Create menu LSTRT: " + me.getAttr('data-fmml-list',''));
            $(_obs.node).addClass("fmmlWaitState");
            return true;
        },
        /** @ignore */
        onListEnd: function(sender,data) {
            console.log("Create menu LEND: " + me.getAttr('data-fmml-list',''));
            $(_obs.node).removeClass("fmmlWaitState");
            me.dmList.removeListener(lstnr);            
            me._fillMenu(_obs);
            me.dmList.dispose();
            me.dmList = null;

            // 
            me._showMenu();
        },
        /** @ignore */
        onListError: function(sender,data) {
            console.log("Create menu LEER: " + me.getAttr('data-fmml-list',''));
            $(_obs.node).removeClass("fmmlWaitState");
            me.dmList.removeListener(lstnr);            
            me._fillMenu(_obs,data);
            me.dmList.dispose();
            me.dmList = null;
            return true;
        }
    };
    this.dmList.addListener(lstnr);
    this.dmList.getData();
    console.log("Create menu2: " + this.getAttr('data-fmml-list',''));
    return true;
}

FM.MlMenu.prototype._showMenu = function() {
    console.log("Showmenu: " + this.getAttr('data-fmml-list',''));
    this.active = true;
    if(this.listNode != this.node) {
        if(this.listNode) {
            $(this.listNode).removeClass("fmmlValueMenuInactive");
            $(this.listNode).addClass("fmmlValueMenuActive");
        }
        $(this.node).removeClass("fmmlValueMenuActive");
        $(this.node).addClass("fmmlValueMenuInactive");        
    }
}

FM.MlMenu.prototype._hideMenu = function() {
    console.log("Hide menu: " + this.getAttr('data-fmml-list',''));
    this.active = false;
    if(this.listNode != this.node) {
        if(this.listNode) {
            $(this.listNode).removeClass("fmmlValueMenuActive");    
            $(this.listNode).addClass("fmmlValueMenuInactive");
        }
        $(this.node).removeClass("fmmlValueMenuInactive");
        $(this.node).addClass("fmmlValueMenuActive");
    }
}


FM.MlMenu.prototype._fillMenu = function(obs,oerr) {
    console.log("Fill menu: " + this.getAttr('data-fmml-list',''));
    $(this.listNode).unbind();
    $(this.listNode).empty();
    var menuId = obs.getAttr('data-fmml-list-id-attr','id');
    var menuText = obs.getAttr('data-fmml-list-text-attr','');
    var attr = obs.getAttr('data-fmml-attr-name','');

    var defSelValue = obs.getAttr('data-fmml-list-def-selected','');
    if(FM.isFunction(window[defSelValue])) defSelValue = window[defSelValue]();

    var defSelAttr = obs.getAttr('data-fmml-list-def-selected-attr','');
    var allowNulls = obs.getAttr('data-fmml-list-allow-null','false');

    var def=null,first = null,cur=null;
    var dmobj = obs ? obs.getDmObject() : null;
    var curVal = dmobj ? dmobj.getAttr(attr,'') : '';
    

    // ok
    if(!FM.isset(oerr)) {
        // null
        if(allowNulls == 'true') {
            $(this.listNode).append('<option value=""></option>');
        }

        // values    
        var me = this;
        this.dmList.forEachListElement(function(index,obj) {
            var defOption = false;
            if(defSelAttr != '' && defSelValue!='') {
                if(obj.getAttr(defSelAttr,'') == defSelValue) {
                    defOption = true;
                    def = obj;
                }
            }

            if(!first) {
                first = obj;
            }
            if(obj.getAttr(menuId,'x') == curVal) {
                cur = obj;
            }
            $(me.listNode).append(
                '<option ' + (defOption ? 'selected="selected"' : '') + ' value="' + obj.getAttr(menuId,'') + '">' +
                obj.getAttr(menuText,'') +
                '</option>'
                );
            return(true);
        });
        
        // listen
        $(me.listNode).change(function() {
            var dmobj = obs.getDmObject();

            var value = $(me.listNode).val();
            if(FM.isset(attr) && attr && attr != '' && dmobj && dmobj.getAttr(attr) !== value) {
                dmobj.setAttr(attr,value,true);
            }
        });
        
        if(cur) {
            $(me.listNode).val(cur.getAttr(menuId,''));
        } else if(def) {
            $(me.listNode).val(def.getAttr(menuId,''));
            if(dmobj) dmobj.setAttr(attr,def.getAttr(menuId,''),true);            
        } else if(allowNulls == 'true') {
            $(me.listNode).val('');
        } else if(first) {
            if(dmobj) dmobj.setAttr(attr,first.getAttr(menuId,''),true);
        //$(me.listNode).val(first.getAttr(menuId,''));
        }

   
    } else {
        $(me.listNode).append(
            '<option value=""><i>' +
            (oerr.getErrorText && oerr.getErrorText() != '' ? oerr.getErrorText() : "Unable to connect to server") +
            '</i></option>'
            );
        
    }
}

// static
FM.MlMenu.className = "MlMenu";
FM.MlMenu.fullClassName = 'gui.MlMenu';

FM.MlExtension.addExtensionType('MlMenu', FM.MlMenu);


