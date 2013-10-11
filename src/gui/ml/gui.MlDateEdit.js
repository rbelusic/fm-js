/**
 * ML date  edit extensions class. 
 * 
 * @class FM.MlDateEdit
 * @extends FM.MlExtension
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
 * @requires http://api.jqueryui.com/datepicker/
 * @description You can use other plugins instead jquery ui by replacing initWidget() method
 */
FM.MlDateEdit = FM.defineClass('MlDateEdit', FM.MlEdit);

FM.MlDateEdit.prototype._init = function(attrs, node) {
    this._super("_init", attrs, node);
    this.objectSubClass = "DateEdit";
    this.editWidgetDate =  null;
}

// methods
FM.MlDateEdit.prototype.initWidget = function() {
    this._super("initWidget");
    this.editWidgetDate = $("<input style='display:none;'></input>")[0];
    $(this.editWidget? this.editWidget : this.node).after(this.editWidgetDate);
    var me = this;
        
    $(this.editWidgetDate).val(this.getObserver().getValue());
    
    var opts = {
        dateFormat: "yy-mm-dd",
         showOn: "both",
        onSelect: function(dateText, oDp) {
            if (obs) {
                me.getObserver().setValue(dateText);
            }
            return true;
        }
    };
    
    this.forEachAttr(function(n,v) {
        if(FM.startsWith(n,'data-fmml-wg-option-')) {
            opts[FM.camelCase(n.substr(20))] = v;
        }
        return true;
    });

    $(this.editWidgetDate).datepicker(opts);
}

FM.MlDateEdit.prototype.disposeWidget = function() {    
    if (this.editWidgetDate) {
        $(this.editWidgetDate).remove();        
    }
    this.editWidgetDate = null;
    
    this._super("disposeWidget");    
}

FM.MlDateEdit.prototype.render = function(value) {
    this._super("render",value);
    
    if (this.editWidgetDate) {
        $(this.editWidgetDate).datepicker( 
            "setDate", this.getObserver().getValue()
        );
    }
}

FM.MlExtension.addExtensionType('DateEdit', FM.MlDateEdit);
