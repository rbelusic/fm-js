/**
* ML attribute edit extensions class. 
* 
* @class FM.MlAttributeEdit
* @extends FM.MlExtension
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
*/
FM.MlAttributeEdit = function() {
    this._init.apply(this, arguments); // new poziva _init()
}

FM.MlAttributeEdit.prototype.triggerEvent = null;
FM.MlAttributeEdit.prototype.editWidget = null;

// methods
FM.MlAttributeEdit.prototype._init = function(attrs,node) {
    this._super("_init",attrs,node);
    this.objectSubClass = "MlAttributeEdit";
    this.triggerEvent = null;
    this.editWidget = null;    
}
FM.extendClass(FM.MlAttributeEdit,FM.MlExtension); 

// properties
FM.MlAttributeEdit.prototype.objectSubClass = "";

// methods
FM.MlAttributeEdit.prototype._cleanup = function(obs) {
    if(FM.isset(this.timer) && this.timer) {
        window.clearInterval(this.timer);
        this.timer = null;
    }
    
    if(this.editWidget) {
        this.editWidget.unbind(this.triggerEvent);
        this.triggerEvent = null;
        $(this.node).unbind('click');
        $(obs.node).html("");
        this.editWidget = null;
    } else {
        if(this.triggerEvent) {
            $(this.node).unbind(this.triggerEvent);
            this.triggerEvent = null;
        }        
    }    
}

FM.MlAttributeEdit.prototype.run = function(obs) {
    this._cleanup(obs);
    this._super("run",obs);
    
    var domnode = this.node;
    this.triggerEvent = obs.getAttr('data-fmml-update-condition','blur');
    if(!FM.isset($(domnode)[this.triggerEvent])) {
        this.triggerEvent = 'blur';
    }
    this.editWidget = null;
    var me = this;
    if(domnode.nodeName == 'INPUT' || domnode.nodeName == 'TEXTAREA') {    
        $(domnode)[this.triggerEvent]/*.change | blur*/(function() {
            var value = 
                $(this).is(':checkbox') ?
                ($(this).is(":checked") ? 'true' : 'false'):
                $(this).val()
            ;   
            var savevalue = value;
            var obs = domnode.fmmlObserver;

            $(domnode).html("");
            $(domnode).text(value);

            if(obs && obs.getDmObject()) {
                var attr = obs.getAttr('data-fmml-attr-name','');
                var vtype = obs.getAttr('data-fmml-attr-type','string');                   
                var dmobj = obs.getDmObject();

                if(vtype == 'date') {
                    var isutc = obs.getAttr('data-fmml-date-is-utc','true') != 'false';
                    savevalue = FM.dateToString(FM.parseLocalDateString(value),isutc);
                }

                if(FM.isset(attr) && attr && attr != '') {
                    dmobj.setAttr(attr,savevalue,true);
                }
            }
            return true;
        }); 
        if(obs.getAttr('data-fmml-attr-value-from-dom','false') == 'true') {
            this.timer = window.setInterval(function() {
                if(FM.isset(domnode.fmmlValueSync) && obs.getNodeValue() != domnode.fmmlValueSync) {
                    var attr = obs.getAttr('data-fmml-attr-name','');
                    var dmobj = obs.getDmObject();
                    dmobj.setAttr(attr,obs.getNodeValue(),true);
                }
            },300);
        }
        
    } else if(domnode.nodeName == 'SELECT') {
        $(domnode)[this.triggerEvent]/*.change | blur*/(function() {
            var value = $(this).val();
            var savevalue = value;             
            var obs = domnode.fmmlObserver;

            if(obs && obs.getDmObject()) {
                var attr = obs.getAttr('data-fmml-attr-name','');
                var vtype = obs.getAttr('data-fmml-attr-type','string');                      
                var dmobj = obs.getDmObject();
                if(vtype == 'date') {
                    var isutc = obs.getAttr('data-fmml-date-is-utc','true') != 'false';
                    savevalue = FM.dateToString(FM.parseLocalDateString(value),isutc);
                }
                if(FM.isset(attr) && attr && attr != '') {
                    dmobj.setAttr(attr,savevalue,true);
                }
            }
            return true;
        });
    } else {
        var edittype = obs.getAttr('data-fmml-attr-edittype','input');
        
        if (edittype == 'textarea') {
            this.editWidget = $("<textarea class='fmmlValueInput'></textarea>");    
        }
        else {
            this.editWidget = $("<input type='text' class='fmmlValueInput'>");
        }
        
        
        $(domnode).click(function() {
            var value = $(this).val();
            var savevalue = value;                      
            var obs = domnode.fmmlObserver;
            if(!obs || !obs.getDmObject()) {
                return true;
            }
            if($(this).children().length < 1) {
                var val = $(this).text();

                if (me.editWidgetAdded != true) {
                    me.editWidget.hide();
                    $(this).after(me.editWidget);    
                }
                $(this).hide();
                
                if (edittype == 'textarea') {
                    me.editWidget.text(val);
                }
                else {
                    me.editWidget.val(val);
                }
            
                if (me.editWidgetAdded != true) {
                    me.inputAdded(obs);        
                }
            };
            me.editWidget.show();
            me.editWidget.focus();
            me.editWidgetAdded = true;
            /*
            var defevobsnodeid = me.getAttr('data-fmml-update-def-event-observer','');            
            if(defevobsnodeid != '') me.editWidget.keypress(function(e) {                
                if(e.keyCode == 13) {
                    me.editWidget[me.triggerEvent]();
                    $('#' + defevobsnodeid).click();             
                }
            });*/
            
            me.editWidget[me.triggerEvent]/*.change | blur*/(function() {
                var value = $(this).val();
                var savevalue = value;             

                $(domnode).text(value);
                $(this).hide();
                $(domnode).show();
                var obs = domnode.fmmlObserver;

                if(obs && obs.getDmObject()) {

                    var attr = obs.getAttr('data-fmml-attr-name','');
                    var vtype = obs.getAttr('data-fmml-attr-type','string');                      
                    var dmobj = obs.getDmObject();
                    if(vtype == 'date') {
                        var isutc = obs.getAttr('data-fmml-date-is-utc','true') != 'false';
                        savevalue = FM.dateToString(FM.parseLocalDateString(value),isutc);
                    }

                    if(FM.isset(attr) && attr && attr != '') {
                        dmobj.setAttr(attr,savevalue,true);
                    }
                }

                return false;
            });

            return false;
        });
    }
        
}

FM.MlAttributeEdit.prototype.dispose = function(obs) {
    this._cleanup(obs);
    
    this._super("dispose");
    this.executed = false;
}

FM.MlAttributeEdit.prototype.inputAdded = function(obs) {
    }

// static
FM.MlAttributeEdit.className = "MlAttributeEdit";
FM.MlAttributeEdit.fullClassName = 'gui.MlAttributeEdit';

FM.MlExtension.addExtensionType('MlAttributeEdit', FM.MlAttributeEdit);

// temp !FIX!
FM.MlExtension.addExtensionType('MlExAttributeEdit', FM.MlAttributeEdit);


