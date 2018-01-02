var fs = require("fs");
var path = require("path");
var bufferCls = require('buffer')
var crypto = require('crypto');
//loop all subfolder files, callback with fileFullPath
function forEachFile(pathToFind,callback){
        if(!fs.existsSync(pathToFind)){
            return;
        }
		dir = ///$/.test(dir) ? dir : dir + '/';
        (function dir(dirpath, fn) {
            if(!dirpath.endsWith("/")){
                dirpath += "/";
            }
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

function forEachFolder(pathToFind,callback){
    if(!fs.existsSync(pathToFind)){
        return;
    }
    dir = ///$/.test(dir) ? dir : dir + '/';
    (function dir(dirpath, fn) {
        if(!dirpath.endsWith("/")){
            dirpath += "/";
        }
        var files = fs.readdirSync(dirpath);
        for (var i in files) {
            var item = files[i];
            var info = fs.statSync(dirpath + "/" + item);
            if (info.isDirectory()) {
                dir(dirpath + item + '/', callback);
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
function writeFileInternal(src, dst, secureKey) {

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
function createFolders(dst,withFileName) {
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




function copyFile(src, dst, secureKey){
	if(fs.existsSync(dst)){
        //check md5
        var s5 = md5(src);
        var d5 = md5(dst);
        if(d5 == s5){
            return;
        }
        fs.unlinkSync(dst);
    }

    createFolders(dst,true);

    writeFileInternal(src, dst, secureKey);
};

function copyFolder(src,dst){
    var len = src.length;
    forEachFile(src,function(file){
        copyFile(file,dst+file.substr(len,file.length-len));
    });
};

function toFolder(folder){
    if(folder.endsWith("/")){
        return folder;
    }
    return folder+"/";
}

function removeFolders(pathToFind){
        if(!fs.existsSync(pathToFind)){
            return;
        }
        pathToFind = toFolder(pathToFind);
		dir = ///$/.test(dir) ? dir : dir + '/';
        (function dir(dirpath) {
            var files = fs.readdirSync(dirpath);
            for (var i in files) {
                var item = files[i];
                var info = fs.statSync(dirpath + "/" + item);
                if (info.isDirectory()) {
                    dir(dirpath + item + '/');
                    fs.rmdirSync(dirpath  + item);
                } else {
                    if(dirpath[dirpath.length-1] == "/"){
                        fs.unlinkSync(dirpath  + item);
                    }
                    else{
                        fs.unlinkSync(dirpath + "/" + item);
                    }
                    
                }

            }

        })(pathToFind);
};
function md5(file){
    var md5sum = crypto.createHash('md5');
    var stream = fs.readFileSync(file);
    md5sum.update(stream);
    return md5sum.digest('hex').toUpperCase();
};

module.exports = {
    //遍历文件夹下所有文件，对每个文件调用callback
	//loop all subfolder files, callback with fileFullPath
	forEachFile:forEachFile,

    //创建文件目录，第二个参数为true代表传入的目录最后不包含文件名
	//pathname, if the path contain the filename
	//default should not contain the filename
    createFolders:createFolders,
    
    forEachFolder:forEachFolder,

    //拷贝源文件到目标文件，第三个参数代表加密参数，为0到8之间
	//src, dst and 0 <= secureKey <= 8
	copyFile:copyFile,

    copyFolder:copyFolder,

    md5:md5,
    
    removeFolders:removeFolders,
};