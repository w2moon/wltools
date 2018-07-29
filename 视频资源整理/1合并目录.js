/**
 * 把指定的文件夹合并成一个,并去除所有目录结构
 */
var wl = require("./tools/file");
var path = require("path");
var folders = [];

function merge(folders,toFolder){
    wl.createFolders(toFolder);
    var files = [];
    function move(file){
        files.push(file);
        
    }
    
    for(var i=0;i<folders.length;++i){
        var folder = folders[i];
        wl.forEachFile(folder,move);
    }

    for(var j=0;j<files.length;++j){
        fs.renameSync(files[j],toFolder+path.basename(files[j]));
    }
}

merge(["./tools/","./tool/"],"./mtool/");