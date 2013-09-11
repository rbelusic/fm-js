/**
* GPS cell class. 
* 
* @class FM.UtGsmCell
*/
FM.UtGsmCell = function() {
    this._init.apply(this, arguments); // new poziva _init()
}

FM.extendClass(FM.UtGsmCell,FM.Object); 

// properties
FM.UtGsmCell.prototype.objectSubClass = "UtGsmCell";

// static
FM.UtGsmCell.className = "UtGsmCell";
FM.UtGsmCell.fullClassName = 'ut.UtGsmCell';

FM.UtGsmCell.prototype._init = function(opt) {            
    this.phoneObject = null;
    this.phoneStatus = false;
    this._super("_init",opt);
    this.objectSubClass = "UtGsmCell";
}

FM.UtGsmCell.prototype._sendPhoneEvent = function(p) {
    console.log("_sendPhoneEvent:" + JSON.stringify(p));
    this.fireEvent("onPhonePosition",p);
}

FM.UtGsmCell.prototype._sendPhoneErrorEvent = function(errormsg) {
    this.fireEvent("onPhoneError",errormsg);
}


FM.UtGsmCell.prototype.isStarted = function() {
    return this.phoneObject != null && this.phoneStatus;
}

FM.UtGsmCell.prototype.stopService = function(sendEvent) {
    if(this.phoneObject) {
        fmRemoveCellListener(this.getID());
        this.phoneObject = null;
    }
    this.phoneStatus = false;
    if(FM.isset(sendEvent) && sendEvent == true) {
        this.fireEvent("onPhoneServiceStopped",this);
    }
}

FM.UtGsmCell.prototype.startService = function(sendEvent) {
    if(this.isStarted()) this.stopService();

    var me = this;
    fmAddCellListener(
        this.getID(),
        function(p) {
             console.log("new UtGsmCell");
            me._sendPhoneEvent(JSON.parse(p));
        },function(error) {
            me._sendPhoneErrorEvent(error.message);
        }
        );        
    this.phoneStatus = true;
    
    if(FM.isset(sendEvent) && sendEvent == true) this.fireEvent("onPhoneServiceStarted","");
}

FM.UtGsmCell.prototype.getPosition = function(cbFn) {
    var me = this;
    var callbackFn = isset(cbFn) && cbFn ? cbFn : function() {};
    fmGetGsmCell(function(p) {
        callbackFn(p);
    });
}
FM.UtGsmCell.prototype.getAllCells = function(cbFn) {
    var me = this;
    var callbackFn = isset(cbFn) && cbFn ? cbFn : function() {};
    fmGetAllGsmCells(function(allp) {
        var p = allp.length > 0 ? allp[0] : {};
        callbackFn(p);
    });
}



FM.UtGsmCell.className = "UtGsmCell";
FM.UtGsmCell.fullClassName = "ut.UtGsmCell";

