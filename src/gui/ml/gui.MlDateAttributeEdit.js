/**
* ML date attribute edit extensions class. 
* 
* @class FM.MlDateAttributeEdit
* @extends FM.MlExtension
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
*/
FM.MlDateAttributeEdit = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(FM.MlDateAttributeEdit,FM.MlExtension); 

// properties
FM.MlDateAttributeEdit.prototype.objectSubClass = "";
FM.MlDateAttributeEdit.prototype.appListener = null;

// methods
FM.MlDateAttributeEdit.prototype.run = function(obs) {
    Date.format="yyyy-mm-dd";
    var domnode = obs.getNode();
    
    this._super("run",obs);
    
    $(domnode).datePicker({
        clickInput: true            
    }).bind('dateSelected',function(e, selectedDate){
        $(this).dpClose();
        var obs = domnode.fmmlObserver;
        if(obs && obs.getDmObject()) {
            var dmobj = obs.getDmObject();
            var attr = obs.getAttr('data-fmml-attr-name','');
            if(attr != '') {
                dmobj.setAttr(
                    attr,FM.dateToString(
                        selectedDate,
                        obs.getAttr('data-fmml-date-is-utc','true') != 'false'
                        ),
                    true
                    );
            }
        }
    });
}



FM.MlExtension.addExtensionType('MlDateAttributeEdit', FM.MlDateAttributeEdit);
