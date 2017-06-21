//把指定目录中的所有指定类型的文件都拷贝到指定目录下
//MoveOutAllFiles.js path .mp3 toPath

var arg = process.argv.splice(2);

var wl = require("./tools/wl.js");

var needExt = arg[1];

var dstPath = "";
if(arg[2]){
	dstPath = arg[2];
}

wl.forEachFile(arg[0],function(file){
	var baseName = path.basename(file);
    var extName = path.extname(file);
	if(!needExt || extName == needExt){
		wl.copyFile(file,dstPath + baseName);
	}
});