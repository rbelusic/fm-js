/**
 * @fileOverview This file has functions related to date and time.
 * @review isipka r0
 */

// -- dates --------------------------------------------------------------------
/**
 * 
 * @ignore
 * @deprecated
 */
FM.dateTimeDivider = ' ';

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 * 
 * http://blog.stevenlevithan.com/archives/date-time-format
 */

/**
 * Basic date and time function.
 * Derived from <a href="https://github.com/slevithan">Steven Levithan</a> date formating function.
 * 
 * @static
 * @function 
 * @param {Date|string=new Date()} [date] The Date class instance or string representing date.
 * @param {string} [mask=FM.dateFormat.masks.default] Format mask to use.
 * @param {boolean} [utc=false] Format UTC values.
 * @see <a href="http://blog.stevenlevithan.com/archives/date-time-format">Steven Levithan blog article</a> for full list of options.
 */
FM.dateFormat = function(date, mask, utc) {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function(val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len)
            val = "0" + val;
        return val;
    };
    var dF = FM.dateFormat;

        if(date && !FM.isObject(date) && (FM.isNumber(date) || (FM.isString(date) && !isNaN(parseInt(date))))) {
            date = new Date(FM.isString(date) ? parseInt(date) : date);
        }

    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
    if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
        mask = date;
        date = undefined;
    }

    // Passing date through Date applies Date.parse, if necessary
    date = date ? new Date(date) : new Date;
    if (isNaN(date))
        throw SyntaxError("invalid date");

    mask = String(dF.masks[mask] || mask || dF.masks["default"]);

    // Allow setting the utc argument via the mask
    if (mask.slice(0, 4) == "UTC:") {
        mask = mask.slice(4);
        utc = true;
    }

    var _ = utc ? "getUTC" : "get",
    d = date[_ + "Date"](),
    D = date[_ + "Day"](),
    m = date[_ + "Month"](),
    y = date[_ + "FullYear"](),
    H = date[_ + "Hours"](),
    M = date[_ + "Minutes"](),
    s = date[_ + "Seconds"](),
    L = date[_ + "Milliseconds"](),
    o = utc ? 0 : date.getTimezoneOffset(),
    flags = {
        d: d,
        dd: pad(d),
        ddd: dF.i18n.dayNames[D],
        dddd: dF.i18n.dayNames[D + 7],
        m: m + 1,
        mm: pad(m + 1),
        mmm: dF.i18n.monthNames[m],
        mmmm: dF.i18n.monthNames[m + 12],
        yy: String(y).slice(2),
        yyyy: y,
        h: H % 12 || 12,
        hh: pad(H % 12 || 12),
        H: H,
        HH: pad(H),
        M: M,
        MM: pad(M),
        s: s,
        ss: pad(s),
        l: pad(L, 3),
        L: pad(L > 99 ? Math.round(L / 10) : L),
        t: H < 12 ? "a" : "p",
        tt: H < 12 ? "am" : "pm",
        T: H < 12 ? "A" : "P",
        TT: H < 12 ? "AM" : "PM",
        Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
        o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
    };

    return mask.replace(token, function($0) {
        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
}



/**
 * Predefined date and time formats.
 * 
 * @namespace 
 * @memberOf FM.dateFormat
 * 
 * @property {string} default "ddd mmm dd yyyy HH:MM:ss"
 * @property {string} shortDate "m/d/yy"
 * @property {string} shortDateTime "m/d/yy HH:MM:ss"
 * @property {string} mediumDate "mmm d, yyyy",
 * @property {string} mediumDateTime "mmm d, yyyy HH:MM:ss",
 * @property {string} longDate "mmmm d, yyyy",
 * @property {string} longDateTime "mmmm d, yyyy HH:MM:ss",
 * @property {string} fullDate "dddd, mmmm d, yyyy",
 * @property {string} fullDateTime "dddd, mmmm d, yyyy HH:MM:ss",
 * @property {string} shortTime "h:MM TT",
 * @property {string} mediumTime "h:MM:ss TT",
 * @property {string} longTime "h:MM:ss TT Z",
 * @property {string} isoDate "yyyy-mm-dd",
 * @property {string} isoTime "HH:MM:ss",
 * @property {string} isoDateTime "yyyy-mm-dd'T'HH:MM:ss",
 * @property {string} fmDateTime "yyyy-mm-dd HH:MM:ss",
 * @property {string} fmUtcDateTime "UTC:yyyy-mm-dd HH:MM:ss",
 * @property {string} fmDate "yyyy-mm-dd",
 * @property {string} fmUtcDate "UTC:yyyy-mm-dd",
 * @property {string} fmTime "HH:MM:ss",
 * @property {string} fmUtcTime "UTC:HH:MM:ss",
 * @property {string} isoUtcDateTime "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
*/
FM.dateFormat.masks = {    
    "default": "ddd mmm dd yyyy HH:MM:ss", 
    shortDate: "m/d/yy",
    shortDateTime: "m/d/yy HH:MM:ss",
    mediumDate: "mmm d, yyyy",
    mediumDateTime: "mmm d, yyyy HH:MM:ss",
    longDate: "mmmm d, yyyy",
    longDateTime: "mmmm d, yyyy HH:MM:ss",
    fullDate: "dddd, mmmm d, yyyy",
    fullDateTime: "dddd, mmmm d, yyyy HH:MM:ss",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    fmDateTime: "yyyy-mm-dd HH:MM:ss",
    fmUtcDateTime: "UTC:yyyy-mm-dd HH:MM:ss",
    fmDate: "yyyy-mm-dd",
    fmUtcDate: "UTC:yyyy-mm-dd",
    fmTime: "HH:MM:ss",
    fmUtcTime: "UTC:HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};


/**
 * Internationalization strings
 * 
 * @ignore
 */
FM.dateFormat.i18n = 
    FM.isset(FM.CultureInfos[FM.getlocale()]) ?
    FM.CultureInfos[FM.getlocale()] : 'en-US'
;




/**
 * Format date using FM.dateFormat.masks.fmDateTime or FM.dateFormat.masks.fmUtcDateTime mask.
 * 
 * @param {string|Date} [dat=new Date()] Date to format.
 * @param {boolean} [utc=false] Format UTC values.
 * @param {string} [format="fmUtcDateTime"] Format mask.
 * @returns {string} Returns empty string on error.
 * @see FM.dateFormat.masks
 */
FM.dateToString = function(dat, utc,format) {
    dat = FM.isset(dat) ? dat : new Date();
    
    try {
        format = FM.isset(format) ? format : (utc ? 'fmUtcDateTime' : 'fmDateTime');
        var s = FM.dateFormat(dat, format);
        return s;
    } catch(e) {
        return '';
    }
}


/**
 * Check if string representing date is parsable.
 * 
 * @param {string} sdate Date string to check.
 * @returns {boolean} 
 * @see FM.dateFormat.masks
 */
FM.isDateString = function(sdate) { 
    if (!FM.isString(sdate)) {
        return false;
    }

    try {
        var ds = FM.dateFormat(sdate);
        var d = new Date(ds);
        return d ? true : false;
    } catch(e) {
        return false;
    }
}


/**
 * Parse date string.
 * 
 * @param {string} sdate String to parse.
 * @param {boolean} [utc=false] Date string represents UTC values.
 * @returns {Date} Returns null on error.
 * @see FM.dateFormat.masks
 */
FM.parseDateString = function(sdate, utc) { 
    if (!FM.isset(sdate) || sdate == null || sdate == '') {
        return(null);
    }

    try {
        var s = FM.dateFormat((utc && !FM.startsWith(sdate,"UTC:") ? 'UTC:' : '') + sdate);
        var d = new Date(s);
        return d;
    } catch(e) {
        return null;
    }
}

/**
 * Parse local date using.
 * This function is shortcut for <i>FM.parseDateString(sdate,false)</i>.
 * 
 * @param {string} sdate String to parse.
 * @returns {Date} Returns null on error.
 * @see FM.parseDateString
 */
FM.parseLocalDateString = function(sdate) {
    return FM.parseDateString(sdate, false);
}


/**
 * Parses UTC date string, converts it to Date object and returns local date string.
 * 
 * @param {string} sdate UTC date string to parse.
 * @param {string} [format="fmDateTime"] Format mask.

 * @returns {string}.
 * @see FM.parseDateString
 */
FM.srv2locDate = function(sdate,format) {
    return(FM.dateToString(FM.parseDateString(sdate, true), false,format));
}

/**
 * Parses local date string, converts it to Date object and returns UTC date string.
 * 
 * @param {string} sdate UTC date string to parse.
 * @param {string} [format="fmUtcDateTime"] Format mask.
 * @returns {string}.
 * @see FM.parseDateString
 */
FM.loc2srvDate = function(sdate,format) {
    return(FM.dateToString(FM.parseDateString(sdate, false), true,format));
}

/**
 * Returns current date and time string in <i>FM.dateFormat.masks.fmDateTime</i> format.
 * 
 * @param {string} [format="fmDateTime"] Format mask.
 * @returns {string}.
 * @see FM.dateFormat.masks.fmDateTime
 */
FM.locNow = function(format) {
    return(FM.dateToString(new Date(), false,format));
}

/**
 * Returns current UTC date and time string in <i>FM.dateFormat.masks.fmDateTime</i> format.
 * 
 * @param {string} [format="fmUtcDateTime"] Format mask.
 * @returns {string}.
 * @see FM.dateFormat.masks.fmDateTime
 */
FM.srvNow = function(format) {
    return(FM.dateToString(new Date(), true,format));
}

/**
 * Returns time difference in seconds between two dates.
 * 
 * @param {Date} d1 From date.
 * @param {Date} d2 To date.
 * @returns {number} On error returns <i>false</i>.
 */
FM.timeBetween = function(d1, d2) {
    if (
        !FM.isset(d1) || !d1 || !FM.isset(d1.getTime) || 
        !FM.isset(d2) || !d2 || !FM.isset(d2.getTime)
        ) {
        return false;    
    }
    // Calculate the difference in milliseconds
    return (d2.getTime()/1000 - d1.getTime()/1000);
}


/**
 * Returns time difference in seconds between two dates in descriptive sentence.
 * Examples:
 *  "3 seconds ago", "3 minutes ago", "3 hours ago", "Yesterday", "3 days ago",
 *  "In 3 seconds", "In 3 minutes", "In 3 hours", "Tomorow", "In 3 days"
 * 
 * @param {Date} d1 From date.
 * @param {Date} d2 To date.
 * @returns {string} On error returns empty string.
 */
FM.strTimeBetween = function(d1, d2) {
    var dif = FM.timeBetween(d1,d2);    
    if (dif == false) {
        return '';    
    }
    var dif_abs = Math.abs(dif);
    

    // The number of milliseconds in one day
    var ONE_DAY = 24;
    var ONE_HOUR = 60;
    var ONE_MINUTE = 60;

    var ret;


    if (dif < 60) {
        ret = FM._T(dif > 0 ? "[:1] seconds ago" : "In [:1] seconds", dif_abs);
    } else { // ONE_MINUTE
        dif_abs = Math.round(dif_abs / ONE_MINUTE);
        if (dif_abs < 60) {
            ret = FM._T(dif > 0 ? "[:1] minutes ago" : "In [:1] minutes", dif_abs);
        } else { // ONE_HOUR
            dif_abs = Math.round(dif_abs / ONE_HOUR);
            if (dif_abs < 24) {
                ret = FM._T(dif > 0 ? "[:1] hours ago" : "In [:1] hours", dif_abs);
            } else { // ONE_DAY
                dif_abs = Math.round(dif_abs / ONE_DAY);

                if (dif_abs == 1) {
                    ret = FM._T(dif > 0 ? "Yesterday" : "Tomorow", dif_abs);
                }
                else {
                    ret = FM._T(dif > 0 ? "[:1] days ago" : "In [:1] days", dif_abs);
                }
            }
        }
    }


    // kraj
    return(ret);
}

/**
 * @ignore
 */
FM.dateLocalFormat = function(d) {
    if (!FM.isset(d) || d == null || d == '')
        return('');

    try {
        var s = d.toLocaleString();
    } catch (err) {
        alert(err)
    }
    ;
    var i = s.indexOf("GMT");
    if (i >= 0)
        s = s.substr(0, i);
    return(s);
}


/**
 * @ignore
 */
FM.startOfHistory = function() {
    return FM.dateFormat(new Date(0),'fmUtcDateTime');    
}

/**
 * @ignore
 */
FM.endOfHistory = function() {
    return FM.dateFormat(new Date(2524608000000),'fmUtcDateTime');
}


/**
 * Returns the number of seconds between midnight of January 1, 1970 and the specified date.
 * 
 * @param {Date} date Date.
 * @returns {number}
 */
FM.timestamp = function(date) {
    return FM.l_timestamp(date) / 1000;
}

/**
 * Returns the number of milliseconds between midnight of January 1, 1970 and the specified date.
 * 
 * @param {Date} date Date.
 * @returns {number}
 */
FM.l_timestamp = function(date) {
    return Math.round((FM.isset(date) ? date : new Date()).getTime());
}


