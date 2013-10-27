var freeModelInstance = new FM.Object({"attribute":"value"});
var restrictedModelInstance = new FM.Object({"attribute":"value"},{"attribute":false});

console.log("TU"+freeModelInstance.getAttr("attribute"));
console.log("TU"+restrictedModelInstance.getAttr("attribute"));
