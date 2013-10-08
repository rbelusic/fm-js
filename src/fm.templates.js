/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */


/**
 * Apply <i>attrs</i> to template.
 * 
 * @static
 * @function 
 * @param {Object} attrs Object with properties to apply.
 * @param {string} template Template text.
 * @param {boolean} [escapeValues=true] If set to <i>true</i> all values will be escaped before applyinig to template.
 * @param {boolean} [encodeValues=false] If set to <i>true</i> all values will be encoded before applyinig to template.
 * @param {string} [prefix=""] Prefix of bind variables in template.
 * 
 * @returns {string} 
 */
FM.applyTemplate = function(attrs, template, escapeValues, encodeValues, prefix) {
    var templ = FM.isset(template) && template ? template : "";
    var pref = FM.isset(prefix) && prefix ? "" + prefix + "." : "";
    var val;
    var me = this;

    // ako imas dmobject
    if (attrs) {
        FM.forEach(attrs, function(name, value) {
            if (!FM.isset(value) || !value)
                value = '';
            if (!FM.isFunction(value) && !FM.isObject(value) && !FM.isArray(value)) {
                if (FM.isset(encodeValues) && encodeValues == true) {
                    val = FM.urlEncode(value.toString());
                } else {
                    val = value;
                }
                if (FM.isset(escapeValues) && escapeValues != false) {
                    val = FM.escapeStr(val);
                }

                templ = templ.replace(new RegExp("\\[\\:" + pref + name + "\\]", "g"), val);
            } else if ((FM.isObject(value) || FM.isArray(value)) && (pref.split(".").length - 1 < 2)) {
                templ = FM.applyTemplate(value, templ, escapeValues, encodeValues, pref + name);
            }
            return true;
        });
    }

    // kraj
    return(templ);
}
