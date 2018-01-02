var path = require("path");
var fs = require("fs");
var wl = require("./file");
var plist = require("./plist");
var exec = require("child_process").exec;
var imageSize = require('image-size');

var gm = require('gm');

var rectScale = function(src,scale){
    var obj = /{({[-\d]+,[-\d]+}),({[-\d]+,[-\d]+})}/ig.exec(src);
    return "{" + sizeScale(obj[1],scale)+","+sizeScale(obj[2],scale)+"}";
};
var sizeScale = function(str,scale){
    var obj = /([-\d]+),([-\d]+)/ig.exec(str);
    return "{"+Math.floor(obj[1]*scale) +","+ Math.floor(obj[2]*scale)+"}";
};

module.exports = function(srcFile,dstFile,scale){
    wl.createFolders(path.dirname(dstFile));
 
    var obj = plist.read(srcFile);
    
    if(obj.blendFuncSource){
        //particle,may be change base64 obj.textureImageData
        wl.copyFile(srcFile,dstFile);
        return;
    }
    else if(obj.metadata.format == 2){
        //cocosstudio
        for(var k in obj.frames){
            var frame = obj.frames[k];
            frame.offset = sizeScale(frame.offset,scale);
            frame.sourceSize = sizeScale(frame.sourceSize,scale);
            frame.frame = rectScale(frame.frame,scale);
            if(frame.sourceColorRect){
                frame.sourceColorRect = rectScale(frame.sourceColorRect,scale);
            }
        }
        obj.metadata.size = sizeScale(obj.metadata.size,scale);
        if(obj.texture){
            obj.texture.width *= scale;
            obj.texture.height *= scale;
        }
    }
    else if(obj.metadata.format == 3){
        //textruepacker
        for(var k in obj.frames){
            var frame = obj.frames[k];
            frame.spriteOffset = sizeScale(frame.spriteOffset,scale);
            frame.spriteSize = sizeScale(frame.spriteSize,scale);
            frame.spriteSourceSize = sizeScale(frame.spriteSourceSize,scale);
            frame.textureRect = rectScale(frame.textureRect,scale);
        }
        obj.metadata.size = sizeScale(obj.metadata.size,scale);

    }
    else if(obj.metadata.format == 0){
        //textruepacker
        for(var k in obj.frames){
            var frame = obj.frames[k];
            frame.width *= scale;
            frame.height *= scale;
            frame.originalWidth *= scale;
            frame.originalHeight *= scale;
            frame.x *= scale;
            frame.y *= scale;
            frame.offsetX *= scale;
            frame.offsetY *= scale;
        }
        obj.metadata.size = sizeScale(obj.metadata.size,scale);
        if(obj.texture){
            obj.texture.width *= scale;
            obj.texture.height *= scale;
        }

    }
    else{
        console.log("can not recognize plist:",srcFile);
        wl.copyFile(srcFile,dstFile);
        return;
    }
    plist.write(dstFile,obj);

// console.log(   obj.metadata.format);
//     var imgFile = srcFile.replace(".plist",".png");
//     var img = gm(imgFile);
//     img.crop(118,71,258,1611);
//   //  img.rotate("green",90);
//     img.write(dstFile.replace(".plist","_min.png"),function(err){
//         console.log(err);
//     });
    
};