/* 
 * dont't forget to include common/ex-common.js first
 * 
 */

// == event methods ==
// two events
fmdemo.AppFmDemo.prototype.onIncreseValue = function(sender,evdata) {
    // increase value attribute in dmobject. all interested parties (listeners on this
    // dmobject (hosts & observers) will be notified with onChange event
    evdata.object.setAttr("value",
        parseInt(evdata.object.getAttr("value",0)) + 1,
        true // send onChange event
        );
}

fmdemo.AppFmDemo.prototype.onDecreaseValue = function(sender,evdata) {
    // decrease value attribute in dmobject. all interested parties (listeners on this
    // dmobject (hosts & observers) will be notified with onChange event
    evdata.object.setAttr("value",
        parseInt(evdata.object.getAttr("value",0)) -1,
        true // send onChange event
        );
}
