/**
* Event ML observer class. Sends event to host.
* 
* Applicable on HTML nodes with <click> event.
* 
* <table>
* <th>List of ML node attributes</th>
* <tr><td>data-fmml-dom-event</td><td>DOM event which trigger FM event. Default is <b>click</b> event</td></tr>
* <tr><td>data-fmml-event-type</td><td>type (name) of event. In case of event type is not defined, successful action processing is triggered immediately</td></tr>
* <tr><td>data-fmml-event-host</td><td>DOM node id of host which will receive event instead of default host</td></tr>
* <tr><td>data-fmml-event-data</td><td>instead current host dmObject send FM.GenericValue object with this value</td></tr>
* <tr><td>data-fmml-verify-observers</td><td>verify all observers first</td></tr>
* <tr><td>data-fmml-event-async</td><td>Signals that event is async (AJAX request wil be triggered)</td></tr>
* <tr><td>data-fmml-exec-on-success</td><td>code to exec when event is successfully completed</td></tr>
* <tr><td>data-fmml-exec-on-error</td><td>code to exec when event error occurred</td></tr>
* <tr><td>data-fmml-redirect-on-success</td><td>redirect to specified URL when event is successfully completed</td></tr>
* <tr><td>data-fmml-redirect-on-error</td><td>redirect to specified URL when event error occurred</td></tr>
* <tr><td>data-fmml-run-on-success</td><td>run host on DOM node with specified id when event is successfully completed</td></tr>
* <tr><td>data-fmml-run-on-error</td><td>run host on DOM node with specified id when event error occurred</td></tr>
* <tr><td>data-fmml-send-form</td><td>send form on host node to URL specified in data-fmml-redirect-on-success node attribute. Host node type must be FORM</td></tr>
* </table>
*
* On case of multiple actions defined on succes or on error, all of them will be executed in following order: 
*  data-fmml-exec-on-*, data-fmml-run-on-*, data-fmml-redirect-on-*
* 
* <table>
* <th>List of ML CSS classes</th>
* <tr><td>fmmlWaitButton</td><td>Async event is in progress</td></tr>
* </table>
* 
* @class FM.MlObserverEvent
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/    
FM.MlObserverEvent = FM.defineClass('MlObserverEvent',FM.MlObserver);

FM.MlObserverEvent.prototype._init = function(app,attrs,node) {
    this._super("_init",app,attrs,node);
    this.objectSubClass ="Event";

    this.eventHost = null;
    this.eventHostNode = null;
}


FM.MlObserverEvent.prototype.run = function() {
    this._super("run");
    
    var me = this;
    
    // dom event
    var evtrigger = this.getAttr('data-fmml-dom-event','click');

    $(this.node)[evtrigger](function(event) {
        event.preventDefault();
        
        // blur form change processing (bad, bad, bad)
        if(document.activeElement != this) { // this -> ev node
            document.activeElement.blur();
        }
        
        // my host & host node
        var myhost = me.getHost();
        var myhostnode = myhost ? myhost.getNode() : null;
        
        // obs verify
        if(myhost && me.getAttr('data-fmml-verify-observers','false') == 'true') {
            if(!myhost.verifyAllObservers(true)) {
                me.setLastError(new FM.DmGenericError({
                    messageId: 'UIVALIDATION',
                    text: 'Please enter all required fields'
                }));
                return false; // force validation of empty attributes
            }
        }
        
        // event host
        me.eventHost = null;
        me.eventHostNode = null;
        var evhostid = me.getAttr('data-fmml-event-host','');
        if(evhostid != '') {
            if(evhostid == 'parent' && myhostnode) {
                me.eventHostNode = FM.findNodeWithAttr(myhostnode.parentNode, "fmmlHost");
            } else {
                me.eventHostNode = FM.getNodeWithId(evhostid);
            }
            if (me.eventHostNode != null) {
                me.eventHost = FM.isset(me.eventHostNode.fmmlHost) ? me.eventHostNode.fmmlHost : null;
            }
            if(me.eventHost == null) me.eventHostNode = null;            
        } else {
            me.eventHost = myhost;    
            me.eventHostNode = myhostnode;    
        }
    
        // data to send
        var evdmobj = null;
        var evdata = me.getAttr('data-fmml-event-data','');
        if(evdata != '') {
            if(FM.startsWith(evdata,'@')) {
                evdata = me.resolveAttrValue("-",evdata);
            } 
            evdmobj = FM.isset(evdata) && evdata && FM.isset(evdata.getAttr) ? evdata : new FM.DmGenericValue({
                value: evdata
            });            
        } else {
            evdmobj = me.getDmObject();
        }

        // event to send
        var ev = me.getAttr('data-fmml-event-type','');
        
        // we are now ready to send
        if(ev && ev != '') {
            // set async class
            if(me.getAttr('data-fmml-event-async','false') === 'true') {
                $(me.node).addClass("fmmlWaitButton");
            }
            
            // clear old success & error hosts
            me._runHostOnNode(document.getElementById(me.getAttr('data-fmml-run-on-success','')),null);
            me._runHostOnNode(document.getElementById(me.getAttr('data-fmml-run-on-error','')),null);
            
            // send event
            me.eventHost.onEvent(me,ev,{
                object: evdmobj,
                callback: function(isok, o) {
                    me.eventCallback(isok, o);
                }
            });
        } else {
            me.eventCallback(true, null);
        }
        return false;
    });
}
 
FM.MlObserverEvent.prototype._runHostOnNode = function(hostnode,dmobj) {
    if(FM.isset(hostnode) && hostnode && FM.isset(hostnode.fmmlHost) && hostnode.fmmlHost) {
        hostnode.fmmlHost.run(dmobj);
    }
}

FM.MlObserverEvent.prototype._redirectToPage = function(url,dmobj) {
    var redirApl = FM.isset(url) && url && url != '' ?
         this.resolveAttrValue('-',FM.isset(dmobj) && dmobj ? FM.applyTemplate(dmobj.getAttr(),url) : url) : 
        ''
    ;
    window.location = redirApl;
}

FM.MlObserverEvent.prototype._sendFormToPage = function(url,dmobj) {
    if(!this.eventHost || !FM.isset(this.eventHostNode.submit)) return;
    
    var redirApl = FM.isset(url) && url && url != '' ?
         this.resolveAttrValue('-',FM.isset(dmobj) && dmobj ? FM.applyTemplate(dmobj.getAttr(),url) : url) : 
        ''
    ;
    
    this.eventHostNode.action = redirApl;
    this.eventHostNode.submit();    
}
            
FM.MlObserverEvent.prototype._execCode = function(code,dmobj) {
    try {
        var val = FM.resolveAttrValue(this.options,"-", code,{
            A: this.getApp(),
            H: this.getHost(),
            O: this,
            D: dmobj
        });
    } catch(e) {
        this.log(e,FM.logLevels.error,'MlObserverEvent._execCode');
    }
}

FM.MlObserverEvent.prototype.eventCallback = function(isok,oResponse) {
    // remove async class 
    $(this.node).removeClass("fmmlWaitButton");

    // exec
    var code = isok ?
        this.getAttr('data-fmml-exec-on-success','') :
        this.getAttr('data-fmml-exec-on-error','')
    ;
    if(code != '') {
        this._execCode(code,oResponse);
    }
    
    // host run
    var hostid = isok ?
        this.getAttr('data-fmml-run-on-success','') :
        this.getAttr('data-fmml-run-on-error','')
    ;
    if(hostid != '') {
        this._runHostOnNode(document.getElementById(hostid),oResponse);
    }        

    // redirect
    var redir = isok ?
        this.getAttr('data-fmml-redirect-on-success','') :
        this.getAttr('data-fmml-redirect-on-error','')
    ;
    if(redir != '') {
        if(this.getAttr('data-fmml-send-form','false') == 'true') {
            this._sendFormToPage(redir,oResponse);
        } else{
            this._redirectToPage(redir,oResponse);
        }
    }
}

FM.MlObserver.addObserver("Event",FM.MlObserverEvent,'GLOBAL');
