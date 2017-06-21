var fs = require("fs");
var path = require("path");
var bufferCls = require('buffer')

//loop all subfolder files, callback with fileFullPath
var forEachFile = function(pathToFind,callback){
		dir = ///$/.test(dir) ? dir : dir + '/';
        (function dir(dirpath, fn) {
            var files = fs.readdirSync(dirpath);
            for (var i in files) {
                var item = files[i];
                var info = fs.statSync(dirpath + "/" + item);
                if (info.isDirectory()) {
                    dir(dirpath + item + '/', callback);
                } else {
                    if(dirpath[dirpath.length-1] == "/"){
                        callback(dirpath  + item);
                    }
                    else{
                        callback(dirpath + "/" + item);
                    }
                    
                }

            }

        })(pathToFind);
};

// secureKey must 0 <= secureKey <=8 
var writeFileInternal = function (src, dst, secureKey) {

    var fd = fs.openSync(src, "r");
    var state = fs.fstatSync(fd);
    if(state.size == 0){
        fs.closeSync(fd);
        fs.writeFileSync(dst, "");
        return;
    }

    var totSize = state.size;
    var MAX_SINGLE_SIZE = 1024000;
    var readedSize = 0;
    var fdw = fs.openSync(dst,"w");
    var readNext = function(){
        var needReadSize = totSize - readedSize;
        if(needReadSize > MAX_SINGLE_SIZE){
            needReadSize = MAX_SINGLE_SIZE;
        }
        var bufferNew = new Buffer(needReadSize);
        fs.readSync(fd, bufferNew, 0, needReadSize, readedSize);
        var len = needReadSize;

        if(secureKey){
        	var key2 = 8 - secureKey;
        	for(var i=0;i<len;++i){
	            bufferNew[i] = bufferNew[i] >>> secureKey | bufferNew[i] << key2;
	        }
        }
        
        fs.writeSync(fdw, bufferNew,0,needReadSize,readedSize);
        delete bufferNew;
        readedSize += needReadSize;
        if(readedSize < totSize){
            readNext();
        }
        else{
            fs.closeSync(fd);
            fs.closeSync(fdw);
        }
    };
    readNext();
};

//the last is filename
var createFolders = function (dst,withFileName) {
    var paths = dst.match(/[^\/]+/g);
    if(!paths || paths.length === 0){
        return false;
    }
    var curPath = [];
    var len = paths.length;
    if(withFileName){
    	len -= 1;
    }
    for(var i=0;i<len;++i){
        curPath.push(paths[i]);
        var pathName = curPath.join("/");
        if(!fs.existsSync(pathName)){
            fs.mkdirSync(pathName);
        }
    }
    return true;
};




var copyFile = function(src, dst, secureKey){
	if(fs.existsSync(dst)){
        fs.unlinkSync(dst);
    }

    createFolders(dst,true);

    writeFileInternal(src, dst, secureKey);
};

module.exports = {
    //遍历文件夹下所有文件，对每个文件调用callback
	//loop all subfolder files, callback with fileFullPath
	forEachFile:forEachFile,

    //创建文件目录，第二个参数为true代表传入的目录最后不包含文件名
	//pathname, if the path contain the filename
	//default should not contain the filename
	createFolders:createFolders,

    //拷贝源文件到目标文件，第三个参数代表加密参数，为0到8之间
	//src, dst and 0 <= secureKey <= 8
	copyFile:copyFile,
	
};