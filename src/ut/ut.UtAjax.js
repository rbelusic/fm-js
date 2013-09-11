/**
* Ajax class. 
* 
* @class FM.UtAjax
* @extends FM.Object
* @param {object} config Options
*/    
FM.UtAjax = function() {    
    var me = this;    
    /** @ignore */
    this._cb_onReadyStateChange = function() {        
        if(me.http.readyState == FM.UtAjax.AJAX_STATE_LOADEND) { // http ok                
            // timeout
            if(me.http.status == 0) {
                return me.fireEvent("onAjaxStateError",new FM.DmGenericError({
                    messageId: "1",
                    text: me.getAttr('url','') + ":\n Timeout or Access-Control-Allow-Origin is not allowed" 
                }));
            }   

            // deserijaliziraj rezultat ako je JSON
            var responseFormat = me.getAttr('responseFormat','TEXT');
            var responseObject = null;
            if(responseFormat == 'JSON') {
                responseObject = FM.unserialize(me.http.responseText,null);
                // neuspjela deserijalizacija
                if(responseObject == null) {
                    return me.fireEvent("onAjaxStateError",new FM.DmGenericError({
                        messageId: "1",
                        text: me.http.responseText != '' ? "Error: " + me.http.responseText : "Invalid response format"
                    }));
                }
            } else {
                responseObject = me.http.responseText;
            }
                
            // provjeri response status code (samo ako nema nikakvog povratnog teksta
            if(true /*me.http.responseText == '' */) {
                var respCodesStr = FM.trim(me.getAttr('validResponseCodes',''));            
                var responseCodes = respCodesStr == '' ? [] : me.getAttr('validResponseCodes','').split(",");            
                var i;
                for(i=0;i < FM.sizeOf(responseCodes); i++) {
                    if(FM.trim(responseCodes[i]) == me.http.status) break;
                }
                if(i != 0 && i == FM.sizeOf(responseCodes)) {
                    return me.fireEvent("onAjaxStateError",new FM.DmGenericError({
                        messageId: "1",
                        text: "Invalid response code (found:" + me.http.status + ", expected:" + responseCodes + ")"
                    }));
                }
            }
            
            // ako sam stigsao do tu sve je ok
            return me.fireEvent(
                "onAjaxStateEnd",
                new FM.DmGenericValue({value: responseObject})
            );
        }
    }
   
    // pozovi konstruktor
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtAjax,FM.Object); 

// properties
FM.UtAjax.prototype.objectSubClass = "";
FM.UtAjax.prototype.http = null;

// methods
FM.UtAjax.prototype._init = function(config) {            
    this._super("_init",config);
    this.objectSubClass = "UtAjax";

    this.http = null;
}

FM.UtAjax.prototype.send = function(args) {
    var url = this.getAttr('url','');
    var params = this.getAttr('params',{});
    var headers = this.getAttr('headers',{});

    
    var pline = "";
    /*
    if(FM.isObject(args)) {
        var val;
        for(var pname in params) {
            val = FM.getAttr(args,pname,'');
            pline = pline + (pline == "" ? "" : "&") + pname + "=" + encodeURIComponent(val);
        }
    }
    */
    if(FM.isObject(args)) {
        
        var val;
        for(var pname in args) {
            if(FM.isset(params[pname])) {
                val = FM.getAttr(args,pname,'');
                if(pname === "_body" && this.getAttr("method","POST") == 'POST') {
                    pline =  /*encodeURIComponent */(val);
                } else {
                    pline = pline + (pline == "" ? "" : "&") + pname + "=" + encodeURIComponent(val);
                }
            }
        }
    }
    
    var callUrl = this.getAttr("method","POST") == 'POST' ? url : url + "?" + pline;
    this.http = FM.UtAjax.initHttpObject();
    if(this.http == null) {
        return this.fireEvent("onAjaxStateError",new FM.DmGenericError({
            messageId: "1",
            text: "Unable to init connection"
        }));
    }
    
    var auth = this.getAttr('auth',null);
    if(auth) {
        this.http.open(
            this.getAttr("method","POST"), 
            callUrl, true,
            this.getAttr('auth.username',''),this.getAttr('auth.password','')
        );
    } else {
        this.http.open(
            this.getAttr("method","POST"), 
            callUrl, true
        );                
    }
    
    if(this.getAttr("method","POST") == 'POST') {
        this.http.setRequestHeader(
            "Content-type", 
            this.getAttr('contentType',"application/x-www-form-urlencoded")
        );
        //this.http.setRequestHeader("Content-length", params.length);
        //this.http.setRequestHeader("Connection", "close");
    } else {
        this.http.setRequestHeader(
            "Content-type", 
            this.getAttr('contentType',"application/x-www-form-urlencoded")
        );        
    }
        
    if(FM.isset(headers) && headers) for(var hdr in headers) {
        this.http.setRequestHeader(hdr, headers[hdr]);
    }
    this.http.onreadystatechange = this._cb_onReadyStateChange;

    // posalji (ovo treba samo za POST, get ima parametre u url-u ali ne smeta)
    this.http.send(pline);

    // event
    return this.fireEvent("onAjaxStateStart",new FM.DmGenericValue({value: args}));
}     


// static
FM.UtAjax.className = "UtAjax";
FM.UtAjax.fullClassName = 'ut.UtAjax';

// mapiranje ajax resp
FM.UtAjax.AJAX_STATE_OPEN = 1;
FM.UtAjax.AJAX_STATE_SEND = 2;
FM.UtAjax.AJAX_STATE_LOADSTART = 3;
FM.UtAjax.AJAX_STATE_LOADEND = 4;

FM.UtAjax.initHttpObject = function() {
/* Primjer sa w3schools, tako radi u IE10 */
    var http = null;
    
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        http = new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        http = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return http;

/* NASE ORIGINAL */
/* 
    if(window.XMLHttpRequest && !(window.ActiveXObject)) {
        try {
            http = new XMLHttpRequest();
        } catch(e1) {
            http = null;
        }
    } else if(window.ActiveXObject) {
        try {
            http = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e2) {
            try {
                http = new ActiveXObject("MSXML2.XMLHTTP.3.0");
            } catch (e3) {
                try {
                    http = new ActiveXObject("Microsoft.XMLHTTP");

                } catch (e4) {
                    http = null;
                }
            }
        }
    }
    return(http);
*/
}
