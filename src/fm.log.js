/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
 * 
 * @ignore
 */
FM.logLevels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 99
}

/**
 * 
 * @ignore
 */
FM.logLevelNames = {
    0: 'DEBUG',
    1: 'INFO',
    2: 'WARN',
    3: 'ERROR',
    99: 'FATAL'
}


/**
 * 
 * @ignore
 */
FM.logDefaultLevel = FM.logLevels.warn;

/**
 *  Set default log level.
 * 
 * @static
 * @function 
 * @param {number} level Log level.
 */
FM.setLogLevel = function(level) {
    FM.logDefaultLevel = level;
}

/**
 *  Get default log level.
 * 
 * @static
 * @function 
 * @returns {number} 
 */
FM.getLogLevel = function() {
    return FM.logDefaultLevel;
}


/**
 * 
 * @ignore
 */
FM.getLogId = function(oObj) {
    return oObj && FM.isset(oObj.getClassName) ? oObj.getClassName() : '<anonymous>';
}

/**
 *  Get log level name for given level.
 * 
 * @static
 * @function 
 * @param {number} level The log level.
 * @returns {string} 
 */
FM.getLogTypeName = function(level) {
    return FM.isset(FM.logLevelNames[level]) ? FM.logLevelNames[level] : FM.logLevelNames[FM.logLevels.info];
}

/**
 * @ignore
 */
FM.logObjectMsgToArray = function(obj) {
    if (!FM.isset(obj) || !obj)
        return [];
    if (FM.isset(obj.length))
        return obj;
    if (FM.isset(obj.toLogArray))
        return(obj.toLogArray());
    var ar = ['('];
    for (var id in obj) {
        ar.push(
            '  ' + id + ":" + (obj[id] === null ? 'null' : (
            FM.isset(obj[id].getClassName) ? obj[id].getClassName() :
            (
                FM.isFunction(obj[id]) ? "function() {...}" :
                (
                    FM.isArray(obj[id]) ? "[...]" :
                    (
                        FM.isObject(obj[id]) ? "{...}" :
                        (
                            obj[id]
                            )
                        )
                    )
                )
            ))
            );
    }
    ar.push(")");
    return ar;
}


/**
 * 
 * @ignore
 */
FM.getStackTraceStr = function(err) {
    err = FM.isset(err) ? err : new Error();

    return err.stack ? err.stack : "";
}

/*
 * 
 * @ignore
 */
FM.getStackTrace = function(err) {
    var strace = FM.getStackTraceStr(err);
    return strace.split("\n").slice(3); //strace.length > 2 ? strace.slice(2) : [];
}

/*
 * 
 * @ignore
 */
FM.getCallerInfo = function(shift) {
    var strace = FM.getStackTrace();
    var pos1, pos2, name, file;
    var lin = "<anonymous>";

    shift = FM.isset(shift) ? shift : 0;
    // mi smo na 1
    if (strace.length < 2 + shift)
        return lin;

    lin = strace[1 + shift];
    pos1 = lin.indexOf("at ");
    if (pos1 < 0)
        return lin;

    lin = lin.substr(pos1 + 3);
    pos1 = lin.indexOf("(");
    pos2 = lin.indexOf(")");
    if (pos1 > -1 && pos2 > -1) {
        name = lin.substr(0, pos1);
        file = lin.substr(pos1 + 1, pos2 - pos1 - 1);
        pos1 = file.lastIndexOf("/");
        if (pos1 > -1) {
            file = file.substring(pos1 + 1);
        }
        lin = name + "(" + file + ")";
    }
    return(lin);
}


/**
 *  Log a message.
 * 
 * @static
 * @function  
 * @param {FM.Object|null} oObj Context.
 * @param {string|Object|...} msg Variable to be logged.
 * @param {number} [level] Log level.
 * @param {string} [callerinfo] Description of context.
 */
FM.log = function(oObj, msg, level, callerinfo) {
    var minlevel =
        oObj && FM.isset(oObj.getLogLevel) && oObj.getLogLevel() != null ?
        oObj.getLogLevel() : FM.getLogLevel()
        ;
    if (!FM.isset(level))
        level = FM.logLevels.info;
    if (level < minlevel)
        return false;
    if (FM.isset(callerinfo) && callerinfo.indexOf('.') < 0) {
        callerinfo = FM.getLogId(oObj) + '.' + callerinfo;
    } else if (!FM.isset(callerinfo)) {
        callerinfo = FM.getLogId(oObj) +
            '.' +
            (FM.isset(FM.log.caller.name) && FM.log.caller.name != '' ? FM.log.caller.name : '<unknown>');
    }

    // formiraj header    
    console.log(
        (FM.isset(callerinfo) ? callerinfo : "Unknown") +
        " [" + FM.getLogTypeName(level) + "]:" +
        (msg && !FM.isString(msg) ? '' : msg)
        );

    if (FM.isObject(msg) || FM.isArray(msg)) {
        console.dir(msg);
    }
    return true;
}
