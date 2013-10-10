/**
 * @fileOverview This file has functions related to date and time.
 * @review isipka
 */

// -- dates --------------------------------------------------------------------
/**
 * 
 * @ignore
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
 * @see <a href="http://blog.stevenlevithan.com/archives/date-time-format">Steven Levithan blog article</a> for full list of options.
 */
FM.dateFormat = function() {
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

    // Regexes and supporting functions are cached through closure
    return function(date, mask, utc) {
        var dF = FM.dateFormat;

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
    };
}();

// Some common format strings
/**
 * 
 * @ignore
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

// Internationalization strings
/**
 * 
 * @ignore
 */
FM.dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};



/**
 * 
 * @ignore
 */
FM.dateToString = function(dat, utc) {
    dat = FM.isset(dat) ? dat : new Date();
    
    try {
        var s = FM.dateFormat(dat, (utc ? 'fmUtcDateTime' : 'fmDateTime'));
        return s;
    } catch(e) {
        return '';
    }
}

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

FM.parseLocalDateString = function(sdate) {
    if (!FM.isset(sdate) || sdate == null || sdate == '')
        return(null);

    try {
        var s = FM.dateFormat(sdate);
        var d = new Date(s);
        return d;
    } catch(e) {
        return null;
    }
}

FM.parseDateString = function(sdate, utc) { 
    if (!FM.isset(sdate) || sdate == null || sdate == '') {
        return(null);
    }

    try {
        var s = FM.dateFormat(sdate + (utc ? 'Z' : ''));
        var d = new Date(s);
        return d;
    } catch(e) {
        return null;
    }
}

/* UTC to local date string */
FM.srv2locDate = function(srvstr) {
    return(FM.dateToString(FM.parseDateString(srvstr, true), false));
}

/* local to UTC date string */
FM.loc2srvDate = function(locstr) {
    return(FM.dateToString(FM.parseDateString(locstr, false), true));
}

/* local now() date string */
FM.locNow = function() {
    return(FM.dateToString(new Date(), false));
}

/* UTC now() date string */
FM.srvNow = function() {
    return(FM.dateToString(new Date(), true));
}

/* calculate time difference in seconds between two dates 
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


/* calculate time difference in seconds between two dates and returns descriptive string
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



FM.startOfHistory = function() {
    return FM.dateFormat(new Date(0),'fmUtcDateTime');    
}

FM.endOfHistory = function() {
    return FM.dateFormat(new Date(2524608000000),'fmUtcDateTime');
}

FM.timestamp = function(date) {
    return FM.l_timestamp(date) / 1000;
}

FM.l_timestamp = function(date) {
    return Math.round((FM.isset(date) ? date : new Date()).getTime());
}


