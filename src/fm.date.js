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
 * 
 * @ignore
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
    var sy, sm, sd, sh, sn, ss;
    var d = dat;

    if (!FM.isset(d) || d == null || d == '')
        return('');

    if (utc) {
        sy = d.getUTCFullYear();
        sm = (d.getUTCMonth() + 1);
        sd = d.getUTCDate();
        sh = d.getUTCHours();
        sn = d.getUTCMinutes();
        ss = d.getUTCSeconds();
    } else {
        sy = d.getFullYear();
        sm = (d.getMonth() + 1);
        sd = d.getDate();
        sh = d.getHours();
        sn = d.getMinutes();
        ss = d.getSeconds();
        ;
    }

    // formiraj string
    return(
        sy +
        (sm < 9 ? '-0' + sm : '-' + sm) +
        (sd < 9 ? '-0' + sd : '-' + sd) +
        (sh < 9 ? ' 0' + sh : FM.dateTimeDivider + sh) +
        (sn < 9 ? ':0' + sn : ':' + sn) +
        (ss < 9 ? ':0' + ss : ':' + ss)
        );
}

FM.isDateString = function(sdate) { // '2010-05-26 05:56:00'
    if (!FM.isString(sdate)) {
        return false;
    }

    var templ = "" + new Date().getFullYear() + '-01-01' + FM.dateTimeDivider + '00:00:00';
    if (sdate.length < templ.length) {
        sdate += templ.substr(sdate.length);
    }
    new RegExp("[-:\\" + FM.dateTimeDivider + "]", "g")
    var arr = sdate.split(new RegExp("[-:\\" + FM.dateTimeDivider + "]", "g"));

    return arr.length == 6;
}

FM.parseLocalDateString = function(sdate) {
    if (!FM.isset(sdate) || sdate == null || sdate == '')
        return(null);

    var d = new Date(isNaN(sdate) ? Date.parse(sdate) : sdate);
    return d && !isNaN(d.getTime()) ? d : null;
}

FM.parseDateString = function(sdate, utc) { // '2010-05-26 05:56:00', true/false
    var fpos = 0, pos;
    var sy = '1970';
    var sm = '01';
    var sd = '01';
    var sh = '00';
    var sn = '00';
    var ss = '00';
    var d;

    if (!FM.isset(sdate) || sdate == null || sdate == '')
        return(sdate);
    if (sdate == FM.endOfHistory() || sdate == FM.startOfHistory())
        return('');

    var templ = "" + new Date().getFullYear() + '-01-01' + FM.dateTimeDivider + '00:00:00';
    if (sdate.length < templ.length) {
        sdate += templ.substr(sdate.length);
    }

    // godina
    pos = sdate.indexOf("-", fpos);
    if (pos < 0) {
        sy = sdate.substr(fpos);
        fpos = -1;
    } else {
        sy = sdate.substr(fpos, pos - fpos);
        fpos = pos + 1;
    }
    if (sy < 1970 || sy > 9999)
        return('');

    // mjesec
    if (fpos > -1) {
        pos = sdate.indexOf("-", fpos);
        if (pos < 0) {
            sm = sdate.substr(fpos);
            fpos = -1;
        } else {
            sm = sdate.substr(fpos, pos - fpos);
            fpos = pos + 1;
        }
    }
    if (sm.substr(0, 1) == '0') {
        sm = sm.substr(1);
    }
    if (sm < 1 || sm > 12)
        return('');

    // dan
    if (fpos > -1) {
        pos = sdate.indexOf(FM.dateTimeDivider, fpos);
        if (pos < 0) {
            sd = sdate.substr(fpos);
            fpos = -1;
        } else {
            sd = sdate.substr(fpos, pos - fpos);
            fpos = pos + 1;
        }
    }
    if (sd.substr(0, 1) == '0') {
        sd = sd.substr(1);
    }
    if (sd < 1 || sd > 31)
        return('');

    // sat
    if (fpos > -1) {
        pos = sdate.indexOf(":", fpos);
        if (pos < 0) {
            sh = sdate.substr(fpos);
            fpos = -1;
        } else {
            sh = sdate.substr(fpos, pos - fpos);
            fpos = pos + 1;
        }
    }
    if (sh.substr(0, 1) == '0') {
        sh = sh.substr(1);
    }
    if (sh < 0 || sh > 23)
        return('');

    // minute
    if (fpos > -1) {
        pos = sdate.indexOf(":", fpos);
        if (pos < 0) {
            sn = sdate.substr(fpos);
            fpos = -1;
        } else {
            sn = sdate.substr(fpos, pos - fpos);
            fpos = pos + 1;
        }
    }
    if (sn.substr(0, 1) == '0') {
        sn = sn.substr(1);
    }
    if (sn < 0 || sn > 59)
        return('');

    // sekunde
    if (fpos > -1) {
        pos = sdate.indexOf(":", fpos);
        if (pos < 0) {
            ss = sdate.substr(fpos);
            fpos = -1;
        } else {
            ss = sdate.substr(fpos, pos - fpos);
            fpos = pos + 1;
        }
    }
    if (ss.substr(0, 1) == '0')
        ss = ss.substr(1);
    if (ss < 0 || ss > 59)
        return('');

    if (utc) {
        d = new Date(
            Date.UTC(
            parseInt(sy), parseInt(sm) - 1, parseInt(sd),
            parseInt(sh), parseInt(sn), parseInt(ss), 0
            )
            );
    } else {
        d = new Date();
        d.setFullYear(parseInt(sy), parseInt(sm) - 1, parseInt(sd));
        d.setHours(parseInt(sh), parseInt(sn), parseInt(ss), 0);
    }

    // kraj
    return isNaN(d.getTime()) ? '' : d;
}

FM.srv2locDate = function(srvstr) {
    return(FM.dateToString(FM.parseDateString(srvstr, true), false));
}

FM.loc2srvDate = function(locstr) {
    return(FM.dateToString(FM.parseDateString(locstr, false), true));
}

FM.locNow = function() {
    return(FM.dateToString(new Date(), false));
}

FM.srvNow = function() {
    return(FM.dateToString(new Date(), true));
}

FM.strTimeBetween = function(d1, d2) {
    if (!FM.isset(d1) || !d1 || d1 == ' ' || !FM.isset(d2) || !d2 || d2 == ' ')
        return '';

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24;
    var ONE_HOUR = 1000 * 60 * 60;
    var ONE_MINUTE = 1000 * 60;
    var ONE_SEC = 1000;

    var dif, ret;

    // Convert both dates to milliseconds
    var date1_ms = d1.getTime();
    var date2_ms = d2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // ONE_SEC
    dif = Math.round(difference_ms / ONE_SEC);

    if (dif < 60) {
        ret = FM._T(date1_ms < date2_ms ? "[:1] seconds ago" : "In [:1] seconds", dif);
    } else { // ONE_MINUTE
        dif = Math.round(difference_ms / ONE_MINUTE);
        if (dif < 60) {
            ret = FM._T(date1_ms < date2_ms ? "[:1] minutes ago" : "In [:1] minutes", dif);
        } else { // ONE_HOUR
            dif = Math.round(difference_ms / ONE_HOUR);
            if (dif < 24) {
                ret = FM._T(date1_ms < date2_ms ? "[:1] hours ago" : "In [:1] hours", dif);
            } else { // ONE_DAY
                dif = Math.round(difference_ms / ONE_DAY);

                if (dif == 1) {
                    ret = FM._T(date1_ms < date2_ms ? "Yesterday" : "Tomorow", dif);
                }
                else {
                    ret = FM._T(date1_ms < date2_ms ? "[:1] days ago" : "In [:1] days", dif);
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
    return '1970-01-01' + FM.dateTimeDivider + '00:00:00';
}

FM.endOfHistory = function() {
    return '2050-01-01' + FM.dateTimeDivider + '00:00:00';
}

FM.timestamp = function(date) {
    return FM.l_timestamp(date) / 1000;
}
FM.l_timestamp = function(date) {
    return Math.round((FM.isset(date) ? date : new Date()).getTime());
}


