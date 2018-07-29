var wl = require("./utils/file");
var path = require("path");
var fs = require("fs");

function formatFileInfo(file){
    var st = fs.statSync(file);
    var info = {};
    info.file = file;
    info.size = st.size;
    return info;
}

function getFolderFileInfos(folder){
    var info = {};
    wl.forEachFile(folder,function(file){
        info[path.basename(file)] = formatFileInfo(file);
    });
    return info;
}

function cmpFolderInfos(info1,info2){
    var needCopyFile = [];
    for(var k in info1){
        if(info2[k]){
            if(info1[k].size > info2[k].size){
                console.log("copy big  from info1",info1[k].file,info1[k].size,info2[k].size);
                needCopyFile.push(info1[k].file);
            }
            else  if(info1[k].size < info2[k].size){
                console.log("info2 is big ",info1[k].file,info1[k].size,info2[k].size);
            }
        }
        else{
            //new 
            needCopyFile.push(info1[k].file);
        }
    }
    return needCopyFile;
}

function processFolder(folder1,folder2){
    var info1 = getFolderFileInfos(folder1);
    var info2 = getFolderFileInfos(folder2);
    var needCopyFile = cmpFolderInfos(info1,info2);
    for(var i=0;i<needCopyFile.length;++i){
        console.log("copyto",folder2+path.basename(needCopyFile[i]));
        fs.copyFileSync(needCopyFile[i],folder2+path.basename(needCopyFile[i]));
    }
}

processFolder("./ttt/","/volumeUSB1/usbshare/ttt/");