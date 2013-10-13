### Basic info

fm-js is a modern light-weight HTML5 full web application framework. 

 - [documentation]()
 - [examples]()
 - tutorial from scratch TODO
 - tutorial for angular programmers TODO

### Prerequisites 

 - [node js](http://nodejs.org/)
 - [grunt](http://gruntjs.com/)
 - [bower](http://bower.io/)

If you already have Nodejs installed, its version must be >= 0.4 (run node --version verify).

### Build system setup

 - [install nodejs](http://howtonode.org/how-to-install-nodejs)

		sudo apt-get install g++ curl libssl-dev apache2-utils
		sudo apt-get install git-core
		git clone git://github.com/ry/node.git
		cd node
		./configure
		make
		sudo make install

 - install grunt globally 

		sudo npm install -g grunt-cli

 - install bower globally 

		sudo npm install -g bower

 - checkout fm-js

		git clone https://github.com/rbelusic/fm-js.git

 - install build system dependencies

		npm install

 - install application dependencies

		bower install

### Build

Run from project root:

		grunt 

If you have maven installed you can also run:
		
		mvn compile 

or any later phase. Maven `pom.xml` is just a wrapper that calls native installed grunt and it's purpose is seamless project integration with Netbeans IDE.

NE MRĐAJ U MASTER NE RADI MI OVO NA VIRTUALKI !!!
