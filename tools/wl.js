var modules = ["file"];

require("./patch.js")

var funcs = {};

var loadModule = function(name) {
	var obj = require("./"+name+".js");
	for(var k in obj){
		if(funcs[k]){
			console.log("error duplicate name of module functions",name);
		}
		funcs[k] = obj[k];
	}
};

for(var i=0;i<modules.length;++i){
	loadModule(modules[i]);
}


module.exports = funcs;