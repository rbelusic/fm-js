/**
 * ML observer value edit extensions class. 
 * 
 * @class FM.MlEdit
 * @extends FM.MlExtension
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
 */
FM.MlEdit = FM.defineClass('MlEdit', FM.MlExtension);

// methods
FM.MlEdit.prototype._init = function(attrs, node) {
    this._super("_init", attrs, node);
    this.objectSubClass = "Edit";
    this.triggerEvent = this.getAttr('data-fmml-update-condition', 'blur') +
        ".fmMlEdit"
    ;
    this.editWidget = null;
}

FM.MlEdit.prototype.run = function(obs) {
    this._super("run", obs);

    if (this.getObserver()) {
        this.getObserver().addRenderer(this);
    }
}

FM.MlEdit.prototype.dispose = function(obs) {
    if (this.getObserver()) {
        this.getObserver().removeRenderer(this);
    }
    
    this._super("dispose");
}

// methods
FM.MlEdit.prototype._setNodeValue = function(node,value) {
    var selStart = node.selectionStart;
    var selEnd = node.selectionEnd;
    if(node.nodeName == 'INPUT' || node.nodeName == 'TEXTAREA') {
        if($(node).is(':checkbox')) {
            if(value && value != '' && value.toLowerCase() != 'false' ) {
                $(node).attr('checked','checked');
            } else {
                $(node).removeAttr('checked');
            }
        } else {
            $(node).val(value);
        }            
    } else if(node.nodeName == 'IMG') {
        value = $(node).attr("src");
    } else if(node.nodeName == 'A') {
        value = $(node).attr("href");
    } else if(FM.isset(node.value)) {
        $(node).val(value);
    } else {
        $(node).html(value);
    }
    
    // selection range restore
    if(FM.isset(node.setSelectionRange)) {
        node.setSelectionRange(selStart, selEnd);
    }    
}

FM.MlEdit.prototype._widgetHide = function() {
    $(this.editWidget).hide();
    $(this.getNode()).show();
}

FM.MlEdit.prototype._widgetShow = function() {
    $(this.getNode()).hide();
    $(this.editWidget).show();
    $(this.editWidget).focus();
    
}

FM.MlEdit.prototype._widgetDefaultCb = function() {
    if(!this.isRendererEnabled()) return true;
    
    var value = $(this.editWidget).val();
    this.getObserver().setValue(value);
    return true;
}

FM.MlEdit.prototype._widgetSelectCb = function() {
    if(!this.isRendererEnabled()) return true;

    var value = $(this.getNode()).val();
    this.getObserver().setValue(value);
    return true;
}

FM.MlEdit.prototype._widgetInputCb = function() {
    if(!this.isRendererEnabled()) return true;

    var value =
        $(this).is(':checkbox') ?
        ($(this).is(":checked") ? 'true' : 'false') :
        $(this).val()
    ;
    this.getObserver().setValue(value);
    return true;
}

FM.MlEdit.prototype._initWidget = function() {
    var domnode = this.getNode();
    var me = this;
    this.editWidget = null;
    var nType = domnode.nodeName;

    if (nType == 'INPUT' || nType == 'TEXTAREA') {
        $(domnode).bind(this.triggerEvent,function() {
            return me._widgetInputCb();
        });
    } else if (domnode.nodeName == 'SELECT') {
        $(domnode).bind(this.triggerEvent,function() {
            return me._widgetSelectCb();
        });
    } else {
        var edittype = this.getAttr('data-fmml-attr-edittype', 'input');

        if (edittype == 'textarea') {
            this.editWidget = $("<textarea class='fmmlValueInput'></textarea>")[0];
        }
        else {
            this.editWidget = $("<input type='text' class='fmmlValueInput'>")[0];
        }
        
        $(this.editWidget).bind(this.triggerEvent,function() {
            return me._widgetDefaultCb();
        });
        
        $(domnode).bind("click.fmMlEdit",function() {
            return me._widgetShow();
        });
        $(this.editWidget).bind("blur.fmMlEdit",function() {
            return me._widgetHide();
        });
        $(this.editWidget).hide();
        $(this.getNode()).after(this.editWidget);
    }
}

FM.MlEdit.prototype._disposeWidget = function() {    
    if(this.editWidget) {
        this._widgetHide();
        $(this.editWidget).unbind(this.triggerEvent);
        $(this.editWidget).unbind("blur.fmMlEdit");
        $(this.getNode()).unbind("click.fmMlEdit");
        $(this.editWidget).remove();
        this.editWidget = null;
    } else {
        $(this.getNode()).unbind(this.triggerEvent);
    }
}


FM.MlEdit.prototype.render = function(value) {
    if(this.editWidget) {
        this._setNodeValue(this.editWidget,value);
    }
    this._setNodeValue(this.node,value);
}

FM.MlEdit.prototype.enableRenderer = function() {
    if(!this.isRendererEnabled()) {
        this._initWidget();
    }
    this._super("enableRenderer");
}

FM.MlEdit.prototype.disableRenderer = function() {
    if(this.isRendererEnabled()) {
        this._disposeWidget();
    }
    this._super("disableRenderer");    
}



FM.MlExtension.addExtensionType('Edit', FM.MlEdit);


