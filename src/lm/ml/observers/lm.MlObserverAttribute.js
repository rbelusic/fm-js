/**
* Attribute ML observer class. 
* 
* <table>
* <th>List of ML node attributes</th>
* <tr><td>data-fmml-attr-type</td><td>type of attribute (string,number,date)</td></tr>
* <tr><td>data-fmml-date-is-utc</td><td>set true if dates is in UTC</td></tr>
* </table>
* 
* <table>
* <th>List of ML CSS classes</th>
* </table>
*
* @class FM.MlObserverAttribute
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/    
FM.MlObserverAttribute = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(FM.MlObserverAttribute, FM.MlObserver);


FM.MlObserverAttribute.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="ObserverAttribute";
}        

FM.MlObserverAttribute.prototype.setNodeValue = function() {
    // conf
    var attrname = this.getAttr('data-fmml-attr-name','');
    var attrtype = this.getAttr('data-fmml-attr-type','string');
    var decplaces = parseInt(this.getAttr('data-fmml-attr-decimals','2'));
    var attrtemplate = this.getAttr('data-fmml-attr-template','');
    var dateIsUtc = this.getAttr('data-fmml-date-is-utc','true') != 'false';
    var dateFormat = this.getAttr('data-fmml-date-display-as','date');
    var defval = this.resolveAttrValue('data-fmml-attr-default-value','');
    var newlntobr = this.resolveAttrValue('data-fmml-attr-newln-br','false');
    var domprop = this.getAttr('data-fmml-observer-dom-property','');
    var dmobj = this.getDmObject();
    
    var alttext = this.getAttr('data-fmml-attr-hover-text','');
        
    // check defval    
    var value = 
        dmobj && attrname != '' ?
        dmobj.getAttr(attrname,'') :
        ''
    ;
    if(dmobj && value == '' && defval != '') {
        return dmobj.setAttr(attrname,defval,true);
    }
    
    // value
    if(value == '') value = defval;
    
    if (this.lastValue == value || dmobj == null) return;
    this.lastValue = value;
    
    // dates
    if(attrtype == "date") {
        if(FM.isDateString(value)) {
             var dateObj = FM.parseDateString(value,dateIsUtc);
            if(dateFormat == 'local') {
                value = FM.dateLocalFormat(dateObj);
            } else if(dateFormat == 'date') {
                value = FM.dateFormat(dateObj,'mediumDate');
            } else if(dateFormat == 'datetime') {
                value = FM.dateFormat(dateObj,'mediumDateTime');
            } else if(dateFormat == 'time') {
                value = FM.dateFormat(dateObj,'isoTime');
            } else if(dateFormat == 'ago') {
                value = FM.strTimeBetween(dateObj,new Date());
            } 
        }  
    } else if(attrtype == "number") {
        value = parseFloat(0.0 + value);
        value = value.toFixed(decplaces);
    }
    if(attrtemplate != "") {
        var app = this.app;
        if (newlntobr == 'true') value = value.replace(/\n/g, "<br />");
        var attrlist = {
            id: value,
            alttext: alttext
        };
        var tname = attrtemplate;
        var me = this;
        
        FM.UtTemplate.getTemplate(app,attrlist,tname,function(isok,templ) {
            if(isok) {
                var tmplstr = FM.applyTemplate(attrlist, templ, false, false);
                var tmplnode = $(tmplstr);
                if(FM.isset(tmplnode[0])) tmplnode = tmplnode[0];

                me.node.innerHTML = '';
                $(me.node).append(tmplnode);
                FM.MlHost.initChildNodes(app, tmplnode);
            }
        });
    
        return;
    }
    // set
    if(domprop !== '') {
        this.node.setAttribute(domprop,value);
    } else if(attrtype == "url") {
        this.node.innerHTML = '';

        if (value != '') {
            var a = document.createElement('a');
            a.setAttribute('href', value);
            a.setAttribute('target', '_blank');
            a.innerText = value;
            
            this.node.appendChild(a);
        }
        else {
            this.node.innerHTML = '&nbsp;';
        }
    } else {    
        if(FM.isset(this.node.value)) {
            var selStart = this.node.selectionStart;
            var selEnd = this.node.selectionEnd;
            this.node.value = value;
            if(FM.isset(this.node.setSelectionRange)) {
                this.node.setSelectionRange(selStart, selEnd);
            }
        } else if(this.node.nodeName == 'IMG') {
            this.log("Attr (img src):" + value,FM.logLevels.warn);
            this.node.setAttribute("src",value);
        } else if(this.node.nodeName == 'A') {
            this.node.setAttribute("href",value);
        } else {
            if (newlntobr == 'true') value = value.replace(/\n/g, "<br />");
            this.node.innerHTML = value == '' ? '&nbsp;' : value;
        }
        this.node.fmmlValueSync = value;
    }
}


FM.MlObserverAttribute.className = "MlObserverAttribute";
FM.MlObserverAttribute.fullClassName = 'lm.MlObserverAttribute';

FM.MlObserver.addObserver("Attribute",FM.MlObserverAttribute,'GLOBAL');
