//把指定目录中的所有指定类型的文件都拷贝到指定目录下
//FileList.js path .cpp "% \\"

var arg = process.argv.splice(2);
var path = require("path");
var wl = require("./tools/wl.js");

var basePath = arg[0];
var needExt = arg[1];

var format = "%";
if(arg[2]){
	format = arg[2];
}



wl.forEachFile(basePath,function(file){
	var baseName = path.basename(file);
    var extName = path.extname(file);
	if(!needExt || extName == needExt){
			var filePath = format.replace("%",file).replace(basePath,"");
			if(filePath.startsWith("/")){
				filePath = filePath.substr(1,filePath.length-1);
			}
			console.log(filePath);
		
	}
});