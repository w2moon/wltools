var path = require("path");
var fs = require("fs");
var wl = require("./file");
var spine = require('../spine-parser');

module.exports = function(srcFile,dstFile,scale){
    wl.createFolders(path.dirname(dstFile));
    
    var buff = fs.readFileSync(srcFile,"utf-8");
    var  atlas = spine.parseAtlas(buff);

    var info = {};
    atlas.regions.forEach((region) => {
        if(!region.page.regions){
            region.page.regions = [];
        }
        region.page.regions.push(region);
    });

    var fd = fs.openSync(dstFile,"w");

    for(var i=0;i<atlas.pages.length;++i){
        fs.writeSync(fd,"\n");
        //atlas.pages
        var page = atlas.pages[i];
        fs.writeSync(fd,page.name+"\n");
        fs.writeSync(fd,"size: "+page.width+","+page.height+"\n");
        fs.writeSync(fd,"format: RGBA8888\n");
        fs.writeSync(fd,"filter: Linear,Linear\n");
        fs.writeSync(fd,"repeat: none\n");

        var regions = page.regions;
        for(var j =0 ;j<regions.length;++j){
            var region = regions[j];
            fs.writeSync(fd,region.name+"\n");
            if(region.rotate){
                fs.writeSync(fd," rotate: true\n");
            }
            else{
                fs.writeSync(fd," rotate: false\n");
            }
            fs.writeSync(fd," xy: "+Math.floor(region.x*0.5)+", "+Math.floor(region.y*0.5)+"\n");
            fs.writeSync(fd," size: "+Math.floor(region.width*0.5)+", "+Math.floor(region.height*0.5)+"\n");
            fs.writeSync(fd," orig: "+Math.floor(region.originalWidth*0.5)+", "+Math.floor(region.originalHeight*0.5)+"\n");
            fs.writeSync(fd," offset: "+Math.floor(region.offsetX*0.5)+", "+Math.floor(region.offsetY*0.5)+"\n");
            fs.writeSync(fd," index: "+region.index+"\n");
        }



    }
    
   

    fs.closeSync(fd);
    
};