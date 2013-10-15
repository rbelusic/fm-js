### Basic info

fm-js is a modern light-weight HTML5 full web application framework. 

 - [documentation]()
 - [examples]()
 - tutorial from scratch TODO
 - tutorial for angular programmers TODO

### Prerequisites 

 - [node js](http://howtonode.org/how-to-install-nodejs)
 - [grunt](http://gruntjs.com/)
 - [bower](http://bower.io/)
 - java with [valid JAVA_HOME environment variable set](http://www3.ntu.edu.sg/home/ehchua/programming/howto/Environment_Variables.html) (required for jsdoc-toolkit to build documentation)

If you already have Nodejs installed, its version must be >= 0.4 (run `node --version` verify).

### Build system setup

 - checkout fm-js

		git clone https://github.com/rbelusic/fm-js.git

 - install build system dependencies

		npm install

 - install application dependencies

		bower install

### Build

Run from project root: `grunt`. If you have maven installed you can also run: `mvn compile` or any later phase. Maven `pom.xml` is just a wrapper that calls native installed grunt and it's purpose is seamless project integration with Netbeans IDE.

