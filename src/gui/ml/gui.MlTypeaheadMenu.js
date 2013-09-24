/**
* ML typeahead menu edit extensions class. 
* 
* @class FM.MlTypeaheadMenu
* @extends FM.MlExtension
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/
FM.MlTypeaheadMenu = FM.defineClass('MlTypeaheadMenu',FM.MlExtension);

FM.MlTypeaheadMenu.prototype._init = function(attrs,node) {
    this._super("_init",attrs,node);
    this.listCache = {};
    this.objectSubClass = "TypeaheadMenu";
}


// methods
FM.MlTypeaheadMenu.prototype._createList = function(obs) {
    var dmconfName = this.getAttr('data-fmml-list','');
    var listOpt = {};
    var pref = 'data-fmml-list-attr-';
    var prefLen = pref.length;
    
    this.forEachAttr(function(pname,value) {
        if(FM.startsWith(pname,pref)) {
            listOpt[pname.substring(prefLen)] = value;
        }                    
        return true;
    });
    
    // input param
    var oObj = obs.getDmObject();
    
    if(oObj && FM.isset(oObj.forEachAttr)) { // fm obect
        oObj.forEachAttr(function(pname,value) {
            listOpt[pname] = value;
            return true;
        });
        listOpt["objectClass"] = oObj.getSubClassName();
    } else if(FM.isArray(oObj) || FM.isObject(oObj)) { // array
        FM.forEach(oObj, function(pname,value) {
            listOpt[pname] = value;
            return true;
        });        
    }
    
    return new FM.DmList(listOpt,dmconfName,obs.getApp());
}

FM.MlTypeaheadMenu.prototype._getItemDataID = function(itm) {
    var srch = "<div id='typeahead-";
    
    var itext = itm.indexOf(srch);
    if(itext < 0) {
        return '';
    }
    var txt = itm.substr(itext + srch.length);
    itext = txt.indexOf("'");
    if(itext < 0) {
        return '';
    }
    return txt.substr(0,itext);
}

FM.MlTypeaheadMenu.prototype.run = function(obs) {
    this._super("run",obs);
    var itmtemplate = 
        "<div id='typeahead-[:data_id]' class=''>" +
        "  <div class='fmmlCover pull-left'>" +
        "    <img class='media-object' src='[:cover_url]'></img>" +
        " </div>" +
        " <div class='media-body'>[:description]</div>" + 
        "</div>"
    ;
    this.listCache = {};
    var me = this;
    var _obs = obs;
    
    $(_obs.getNode()).typeahead({
        updater: function(itm) {
            /*
            var srch = "<div class='media-body'>";
            var qry = this.query;
            var itext = itm.indexOf(srch);
            if(itext < 0) {
                return false;
            }
            var btxt = itm.substr(0,itext + srch.length);
            var txt = itm.substr(itext + srch.length);
            itext = txt.indexOf("</div>");
            if(itext < 0) {
                return false;
            }
            var tag = txt.substr(0,itext);
            */
            // run host if required
            var hostid = me.getAttr('data-fmml-typeahead-add-to-on-select','');
            if(hostid != '') {
                var node = document.getElementById(hostid);
                if( node && FM.isset(node.fmmlHost) && node.fmmlHost && 
                    FM.isset(node.fmmlHost.onAddObjectToList)
                ) {
                    var o = FM.getAttr(me.listCache,itm,null);
                    if(o) node.fmmlHost.onAddObjectToList(this,{object: o});
                }
            }
            return ''; //tag;
        },
        highlighter: function(itm) {
            var o = FM.getAttr(me.listCache,itm,null);
            if(!o) return itm;
            var attr = me.getAttr('data-fmml-attr-name','');
            var menuText = me.getAttr('data-fmml-list-text-attr',attr);
            var menuImg = me.getAttr('data-fmml-img-attr','icon_url');
            
            var itmstr = FM.applyTemplate({
                    data_id: FM.md5(itm),
                    cover_url: o.getAttr(menuImg),
                    description: o.getAttr(menuText,'...')
                }, 
                itmtemplate, 
                false, false
            );
            var inode = $(itmstr)[0];

            return inode;
            
            var srch = "<div class='media-body'>";
            var qry = this.query;
            var itext = itm.indexOf(srch);
            if(itext < 0) {
                return false;
            }
            var btxt = itm.substr(0,itext + srch.length);
            var txt = itm.substr(itext + srch.length);
            itext = txt.indexOf("</div>");
            if(itext < 0) {
                return false;
            }
            var atxt = txt.substr(itext);
            txt = txt.substr(0,itext).replace(qry,'<strong>' + qry + "</strong>");
            return btxt + txt + atxt;
            
        },
        matcher: function(itm) {
            var dmobj = FM.getAttr(me.listCache,itm,null);
            var attr = me.getAttr('data-fmml-attr-name','');
            var menuText = me.getAttr('data-fmml-list-text-attr',attr);
            var txt = dmobj.getAttr(menuText,'');
            var qry = this.query;
/*            
            var srch = "<div class='media-body'>";
            var itext = itm.indexOf(srch);
            if(itext < 0) {
                return false;
            }
            var txt = itm.substr(itext + srch.length);
            itext = txt.indexOf("</div>");
            if(itext < 0) {
                return false;
            }
            txt = txt.substr(0,itext);
*/
            return FM.isString(txt) && FM.isString(qry) && txt.toLowerCase().indexOf(qry.toLowerCase()) > -1;
        },
        source: function(val,cbFn){
            var attr = me.getAttr('data-fmml-attr-name','');
            var lstattr = me.getAttr('data-fmml-list-attr-name',attr);
            if(attr != '') {
                var dmList = me._createList(_obs);
                dmList.setAttr(lstattr,val);
                var lstnr = {
                    /** @ignore */
                    onListEnd: function(sender,data) {
                        dmList.removeListener(lstnr);
                        var menuText = obs.getAttr('data-fmml-list-text-attr',attr);
                        var menuImg = obs.getAttr('data-fmml-img-attr','icon_url');
                        var retc = [];
                        dmList.forEachListElement(function(i,o) {
                            var itmstr = FM.applyTemplate({
                                    data_id: FM.md5(o.getDataID()),
                                    cover_url: o.getAttr(menuImg),
                                    description: o.getAttr(menuText,'...')
                                }, 
                                itmtemplate, 
                                false, false
                            );
                            var inode = $(itmstr)[0];
                            inode.fmmlMenuDmObject = o;
                            retc.push(o.getDataID());
                            me.listCache[o.getDataID()] = o;
                            return true;
                        });
                        dmList.dispose();
                        cbFn(retc);
                    },
                    onListError: function(sender,data) {
                        dmList.removeListener(lstnr);
                        dmList.dispose();
                        cbFn([]);
                    }
                };
                dmList.addListener(lstnr);
                dmList.getData(false);
            }
        },
        items: parseInt(me.getAttr('data-fmml-list-size','7')),
        minLength: parseInt(me.getAttr('data-fmml-typeahead-chars','2'))
    });
    
    return true;
}


FM.MlExtension.prototype.dispose = function(obs) {
    this.listCache = {};
    this._super("dispose",obs);
    this.executed = false;
}


// static
FM.MlExtension.addExtensionType('MlTypeaheadMenu', FM.MlTypeaheadMenu);


