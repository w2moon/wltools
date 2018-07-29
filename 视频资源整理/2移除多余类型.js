var wl = require("./tools/file");
var path = require("path");
var fs = require("fs");
var validExts = [".mp4",".mkv",".avi",".rmvb",".rm",".iso",".wmv"];

var files = [];
wl.forEachFile("./tools",function(file){
    var ext = path.extname(file).toLowerCase();
    if(validExts.indexOf(ext) == -1){
        files.push(file);
    }
    
});

for(var i=0;i<files.length;++i){
    fs.unlinkSync(files[i]);
}