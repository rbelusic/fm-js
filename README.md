### Basic info

fm-js is a modern light-weight HTML5 full web application framework. 

 - [documentation](https://rawgithub.com/rbelusic/fm-js/master/doc/generated/index.html)
 - [examples](https://github.com/rbelusic/fm-js/tree/master/html/examples)
 - tutorial from scratch TODO
 - tutorial for angular programmers TODO

### Prerequisites 

 - [node.js](http://howtonode.org/how-to-install-nodejs)
 - [grunt](http://gruntjs.com/)
 - [bower](http://bower.io/)
 - java with [valid JAVA_HOME environment variable set](http://www3.ntu.edu.sg/home/ehchua/programming/howto/Environment_Variables.html) (required for jsdoc-toolkit to build documentation) (needed for apidoc generation only)

If you already have node.js installed, its version must be >= 0.4 (run `node --version` to verify).


### Build

Run from project root: `grunt`. If you have maven installed you can also run: `mvn compile` or any later phase. Maven `pom.xml` is just a wrapper that calls native installed grunt and it's purpose is project data integration with Netbeans IDE UI wich is almost seamless.




