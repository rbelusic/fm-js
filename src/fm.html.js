/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
 * @ignore
 * 
 */
FM.nodeToHtml = function(node) {
    var el = document.createElement("p");
    el.appendChild(node);
    var retc = el.innerHTML;
    el.removeChild(node);
    return retc;
}

/**
 * @ignore
 * 
 */
FM.findNodeWithAttr = function(node, attrName) {
    while (FM.isset(node) && node && !FM.isset(node[attrName])) {
        node = node.parentNode;
    }
    return(
        FM.isset(node) && node ? node[attrName] : null
        );
}

/**
 * @ignore
 * 
 */
FM.getNodeWithId = function(id) {
    var jo = $('#' + id);
    if (jo.length < 1)
        return null;
    return jo[0];
}

/**
 * @ignore
 *
 */
FM.cancelEventPropagation = function() {
    e = window.event;
    //IE9 & Other Browsers
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    //IE8 and Lower
    else {
        e.cancelBubble = true;
    }
}

/**
 * @ignore
 *
 */
FM.deleteCookie = function(name, domain) {
    FM.saveCookie(name, "", 0, domain);
    //document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
}

/**
 * @ignore
 *
 */
FM.saveCookie = function(name, value, expiredays, domain) {
    var daysahead, expires = null;

    if (FM.isset(expiredays)) {
        daysahead = parseInt(expiredays);
        if (daysahead <= 0)
            daysahead = 3650; // 10 godina = zauvijek
    } else {
        daysahead = 3650; // 10 godina = zauvijek
    }
    expires = new Date();
    expires.setDate(expires.getDate() + daysahead);

    if (!FM.isset(value) || value == null)
        value = {};

    document.cookie =
        name + "=" +
        escape(FM.isString(value) ? value : FM.arrayToUrl(value)) +
        (FM.isset(domain) && domain ? ";domain=" + domain : "") +
        "; path=/" +
        ((expires == null) ? "" : "; expires=" + expires.toGMTString())
        ;

    return document.cookie;
}


/**
 * @ignore
 *
 */
FM.loadCookie = function(name, asstring) {
    var dc = document.cookie;
    var cname = name + "=";
    var cbegin, cend, retstr = "";

    asstring = FM.isset(asstring) ? asstring == true : false;

    if (dc.length > 0) {
        cbegin = dc.indexOf(cname);
        if (cbegin != -1) {
            cbegin += cname.length;
            cend = dc.indexOf(";", cbegin);
            if (cend == -1)
                cend = dc.length;
            retstr = unescape(dc.substring(cbegin, cend));
        }
    }

    return asstring ? retstr : FM.urlToArray(retstr);
}

/**
 * HTML escape string.
 * 
 * @static
 * @function 
 * @param {string} str String to escape.
 * @returns {string} Escaped string.
 * 
 */
FM.escapeStr = function(str) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    return str;
}

/**
 * HTML unescape string.
 * 
 * @static
 * @function 
 * @param {string} str String to unescape.
 * @returns {string} Unescaped string.
 * 
 */
FM.unescapeStr = function(str) {
    str = str.replace(/&amp;/g, "&");
    str = str.replace(/&gt;/g, ">");
    str = str.replace(/&lt;/g, "<");
    str = str.replace(/&quot;/g, "\"");
    str = str.replace(/&#039;/g, "'");
    return str;
}

/**
 * URL encode string.
 * 
 * @static
 * @function 
 * @param {string} s String to encode.
 * @returns {string} Encoded string.
 * 
 */
FM.urlEncode = function(s) {
    return encodeURIComponent(s).replace(/\%20/g, '+').replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/\~/g, '%7E');
}

/**
 * URL decode string.
 * 
 * @static
 * @function 
 * @param {string} s String to decode.
 * @returns {string} Decoded string.
 * 
 */
FM.urlDecode = function(s) {
    return decodeURIComponent(s.replace(/\+/g, '%20').replace(/\%21/g, '!').replace(/\%27/g, "'").replace(/\%28/g, '(').replace(/\%29/g, ')').replace(/\%2A/g, '*').replace(/\%7E/g, '~'));
}

/**
 * Encode all array elements or object properties as URL query arguments.
 * 
 * @static
 * @function 
 * @param {Array|Object} params Array or object to encode.
 * @returns {string} Encoded string.
 * 
 */
FM.arrayToUrl = function(params) {
    var ret = "";
    var first = true;
    for (var vname in params) {
        if (first != true)
            ret = ret + '&';
        ret = ret + vname + '=' + FM.urlEncode(params[vname]);
        first = false;
    }

    return ret;
}

/**
 * Decode URL encoded parameters to object properties.
 * 
 * @static
 * @function 
 * @param {string} url.
 * @returns {Object}
 * 
 */
FM.urlToArray = function(url) {
    //location.queryString = {};
    var arr = {};

    var pairs = url.split("&");

    for (var i = 0; i < pairs.length; i++) {
        var keyval = pairs[ i ].split("=");
        arr[ keyval[0] ] = FM.isset(keyval[1]) ? FM.urlDecode(keyval[1]) : '';
    }

    return arr;
}

/**
 * Determine if a string is URL.
 * 
 * @static
 * @function 
 * @param {string} s The string to be checked.
 * @returns {boolean} 
 */
FM.isURL = function(s) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);
}


/**
 * Return chosen page information 
 * or object representing page info and all URL query parameters as name,value pairs.
 * {
 *   _page: {
 *     host: "...",
 *     url: "...",
 *     path: "...",
 *     name: "..."
 *     fullname: "..."
 *   },
 *   arg1: v1,
 *   arg2: v2,
 *   ...
 * }
 * @static
 * @function 
 * @param {string} [attr] The name of attrribute to return.
 * @param {string} [def] Default return value.
 * @returns {string} 
 */
FM.getArgs = function(attr, def) {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        pair[0] = FM.urlDecode(pair[0]);
        pair[1] = FM.isset(pair[1]) ? FM.urlDecode(pair[1]) : '';

        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], pair[1]];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    }

    var args = query_string;
    var hash = FM.isset(window.location.hash) && window.location.hash ?
        window.location.hash : '';
    if(FM.startsWith(hash, "#")) {
        hash = hash.substring(1);
    }
        
    args._page = {
        host: window.location.protocol + "//" + window.location.host +
            (window.location.port == '' ? '' : ":" + window.location.port),
        url: window.location.href,
        path: window.location.pathname,
        hash: hash
    }

    var pnamearr = args._page.path.split("/");
    args._page.fullname = pnamearr.length > 0 ? pnamearr[pnamearr.length - 1] : args._page.path;
    var i = args._page.fullname.lastIndexOf(".");
    args._page.name = i > -1 ?
        args._page.fullname.substring(0, i) :
        args._page.fullname
        ;

    return FM.isset(attr) && attr ? FM.getAttr(args, attr, def) : args;
}


/**
 * Disable full screen.
 * 
 * @static
 * @function 
 */
FM.cancelFullscreen = function() {
    if (document.cancelFullScreen) {
        document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
}

/**
 * Show DOM node in full screen mode.
 * 
 * @static
 * @function 
 * @param {string|DOM node} elmid DOM node or id of DOM node.
 */
FM.expandToFullSCreen = function(elmid) {
    var elem = FM.isString(elmid) ? document.getElementById(elmid) : elmid;
    if (elem.requestFullScreen) {
        elem.requestFullScreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen();
    }
}


/**
 * Returns browser defined language code.
 * 
 * @static
 * @function 
 * @returns {string}
 */
FM.getPreferedLanguage = function() {
    return (window.navigator.userLanguage || window.navigator.language).split('-')[0];
}
