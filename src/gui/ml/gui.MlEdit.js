/**
 * ML observer value edit extensions class. 
 * 
 * @class FM.MlEdit
 * @extends FM.MlExtension
 * @param {FM.AppObject} app Current application.
 * @param {object} [attrs] DOM node attributes
 */
FM.MlEdit = FM.defineClass('MlEdit', FM.MlExtension);

// methods
FM.MlEdit.prototype._init = function(app,attrs) {
    this._super("_init", app, attrs);
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

    this._super("dispose",obs);
}

// methods
FM.MlEdit.prototype._setNodeValue = function(node, value) {
    var doSelection =false;
    try {
        doSelection = node.selectionStart ? true : false;
    } catch(e){
        
    }
    var selStart = 0,selEnd = 0;
    if (doSelection) {
        selStart = node.selectionStart;
        selEnd = node.selectionEnd;
    }
    
    
    if (node.nodeName == 'INPUT' || node.nodeName == 'TEXTAREA') {
        if ($(node).is(':checkbox')) {
            if (value && value != '' && value.toLowerCase() != 'false') {
                $(node).attr('checked', 'checked');
            } else {
                $(node).removeAttr('checked');
            }
        } else if ($(node).is(':radio')) {
            $("input:radio[name ='" + $(node).attr("name") + "']").val([value]);
        } else {
            $(node).val(value);
        }
    } else if (node.nodeName == 'IMG') {
        value = $(node).attr("src");
    } else if (node.nodeName == 'A') {
        value = $(node).attr("href");
    } else if (FM.isset(node.value)) {
        $(node).val(value);
    } else {
        $(node).html(value);
    }

    // selection range restore
    if (doSelection) {
        node.setSelectionRange(selStart, selEnd);
    }
}

FM.MlEdit.prototype.widgetHide = function() {
    $(this.editWidget).hide();
    $(this.getNode()).show();
}

FM.MlEdit.prototype.widgetShow = function() {
    $(this.getNode()).hide();
    $(this.editWidget).show();
    this.getObserver().setNodeValue(true);
    $(this.editWidget).focus();

}

FM.MlEdit.prototype.widgetCb = function(node) {
    if (!this.isRendererEnabled()) {
        return true;
    }

    //var node = this.editWidget ? this.editWidget : this.getNode();
    if (!node) {
        return true;
    }
    var value =
        $(node).is(':checkbox') ?
        ($(node).is(":checked") ? 'true' : 'false') : (
            $(node).is(':radio') ? 
            $("input:radio[name ='" + $(node).attr("name") + "']:checked").val() :
            (FM.isset(node.value) ? $(node).val() : $(node).html())
        );
    if(FM.isArray(value) && value.length < 2) {
        value = value.length==0 ? "" : value[0];
    }
    this.getObserver().setValue(value);
    return true;
}

FM.MlEdit.prototype.initWidget = function() {
    var domnode = this.getNode();
    var me = this;
    this.editWidget = null;
    var nType = domnode.nodeName;

    if (nType == 'INPUT' || nType == 'TEXTAREA' || nType == 'SELECT') {
        if ($(domnode).is(':radio')) {
            $("input:radio[name ='" + $(domnode).attr("name") + "']").bind(this.triggerEvent, function() {
                return me.widgetCb(this);
            });
        } else {
            $(domnode).bind(this.triggerEvent, function(a,b,c) {
                return me.widgetCb(this);
            });
        }
    } else {
        var edittype = this.getAttr('data-fmml-attr-edittype', 'input');

        if (edittype != 'input') {
            this.editWidget = $("<" + edittype + " class='fmmlValueInput'></" + edittype + ">")[0];
        } else {
            this.editWidget = $("<input type='text' class='fmmlValueInput'>")[0];
        }

        $(this.editWidget).bind(this.triggerEvent, function() {
            return me.widgetCb(this);
        });

        $(domnode).bind("click.fmMlEdit", function() {
            return me.widgetShow();
        });
        $(this.editWidget).bind("blur.fmMlEdit", function() {
            return me.widgetHide();
        });
        $(this.editWidget).hide();
        $(this.getNode()).after(this.editWidget);
    }
}

FM.MlEdit.prototype.disposeWidget = function() {
    if (this.editWidget) {
        this.widgetHide();
        $(this.editWidget).unbind(this.triggerEvent);
        $(this.editWidget).unbind("blur.fmMlEdit");
        $(this.getNode()).unbind("click.fmMlEdit");
        $(this.editWidget).remove();
        this.editWidget = null;
    } else {
        if ($(this.getNode()).is(':radio')) {
            $("input:radio[name ='" + $(this.getNode()).attr("name") + "']").unbind(this.triggerEvent);
        } else {
            $(this.getNode()).unbind(this.triggerEvent);
        }
    }
}


FM.MlEdit.prototype.render = function(value) {
    if (this.editWidget) {
        this._setNodeValue(this.editWidget, value);
    }
    this._setNodeValue(this.getNode(), value);
}

FM.MlEdit.prototype.enableRenderer = function() {
    if (!this.isRendererEnabled()) {
        this.initWidget();
    }
    this._super("enableRenderer");
}

FM.MlEdit.prototype.disableRenderer = function() {
    if (this.isRendererEnabled()) {
        this.disposeWidget();
    }
    this._super("disableRenderer");
}



FM.MlExtension.addExtensionType('Edit', FM.MlEdit);


