var emptyModelInstance = new FM.Object();
var initializedModelInstance = new FM.Object({"attribute":"value"});

console.log("evaulates to true: " + (emptyModelInstance.getChangedAttrList() === {}));
console.log("evaulates to true: " + (emptyModelInstance.isChanged() === false));
console.log("evaulates to true: " + (initializedModelInstance.getChangedAttrList() === {}));
console.log("evaulates to true: " + (initializedModelInstance.isChanged() === false));

emptyModelInstance.setAttr("attribute","value");
console.log("evaulates to true: " + (emptyModelInstance.getChangedAttrList() === {}));
console.log("evaulates to true: " + (emptyModelInstance.isChanged() === true));

initializedModelInstance.setAttr("attribute","value");
console.log("evaulates to true: " + (initializedModelInstance.getChangedAttrList() === {}));
console.log("evaulates to true: " + (initializedModelInstance.isChanged() === false));

initializedModelInstance.setAttr("attribute","value2");
console.log("evaulates to true: " + (initializedModelInstance.getChangedAttrList() === {"attribute":"value2"}));
console.log("evaulates to true: " + (initializedModelInstance.isChanged() === true));