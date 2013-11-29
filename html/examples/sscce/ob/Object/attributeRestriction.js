var freeModelInstance = new FM.Object({"attribute":"value"});
console.log("evaulates to true: " + (freeModelInstance.getAttr("attribute") === "value"));
freeModelInstance.setAttr("anotherAttribute","someValue");
console.log("evaulates to true: " + (freeModelInstance.getAttr("anotherAttribute") === "someValue"));

var restrictedModelInstance = new FM.Object({},["attribute"]);
console.log("evaulates to true: " + (restrictedModelInstance.getAttr("attribute") === ""));
restrictedModelInstance.setAttr("attribute","value");
console.log("evaulates to true: " + (restrictedModelInstance.getAttr("attribute") === "value"));
restrictedModelInstance.setAttr("illegalAttribute","value");
console.log("evaulates to false: " + (restrictedModelInstance.getAttr("illegalAttribute") === "value"));
console.log("evaulates to true: " + (restrictedModelInstance.getAttr("illegalAttribute") === ""));

var restrictedInitializedModelInstance = new FM.Object({"attribute":"value",illegalAttribute:"value"},["attribute"]);
console.log("evaulates to true: " + (restrictedInitializedModelInstance.getAttr("attribute") === "value"));
console.log("evaulates to false: " + (restrictedInitializedModelInstance.getAttr("illegalAttribute") === "value"));
console.log("evaulates to true: " + (restrictedInitializedModelInstance.getAttr("illegalAttribute") === ""));

