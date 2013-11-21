/* 
 * dont't forget to include common/ex-common.js first
 * 
 */
// == create static dm list from date format definitions
FM.DmList.addConfiguration('dateFormats', {
    responseObject: FM.DmObject,
    data: (function(){
        var lst =[];
        var d = new Date();
        FM.forEach(FM.dateFormat.masks,function(name,format) {
            lst.push({name:name, mask: format, example: FM.dateFormat(d, format)})
            return true;
        });
        return lst;
    }).call()
});

