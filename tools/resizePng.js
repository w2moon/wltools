var gm = require('gm');
var path = require('path');
var wl = require('./file');
module.exports = function(srcFile,dstFile,scale){
    var img = gm(srcFile);
    img.size(function (err, size) {
        if(err){
            console.log("img size err "+srcFile+ " err:"+err);
            return;
        }
        if(size.width%2 != 0 || size.height%2 != 0){
            console.log("img size is not power of 2",srcFile,"width",size.width,"height",size.height);
        }
        wl.createFolders(path.dirname(dstFile));
        img.resize(size.width*scale,size.height*scale).write(dstFile,function(err){
            if(err){
                console.log("img resize err "+srcFile+ " err:"+err);
            }
            
        });
    });
}