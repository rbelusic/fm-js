/**
 * @fileOverview This file has functions related to validation.
 * @review isipka
 */
/**
 * Determine if a variable containing e-mail address.
 * 
 * @static
 * @function 
 * @param email The variable to be checked.
 * @returns {boolean} 
 */
FM.validateEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}



