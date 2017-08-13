//把指定目录中的所有指定类型的文件都拷贝到指定目录下
//moveOutAllFiles.js path .mp3 toPath
import * as path from 'path';

let arg = process.argv.splice(2);

let wl = require("./tools/wl.js");

let needExt = arg[1];

let dstPath = "";
if(arg[2]){
	dstPath = arg[2];
}

wl.forEachFile(arg[0],function(file:string){
	let baseName = path.basename(file);
    let extName = path.extname(file);
	if(!needExt || extName == needExt){
		wl.copyFile(file,dstPath + baseName);
	}
});