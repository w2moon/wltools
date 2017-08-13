//转换指定文件或目录里的所有视频hash文件
//modifyVideoHash filePath
import * as fs from 'fs';
import * as path from 'path';

let wl = require("./wl.js");


let arg = process.argv.splice(2);
let filePath = arg[0];

/**
 * 修改视频文件file的hash值
 * @param file 文件路径.
*/
function modifyVideoHash(file:string){
    fs.open(file, 'r+', function(err,fd : number){
        fs.fstat(fd, function(err,stat : fs.Stats){
            let position = stat.size - 1;
            let buff = new Buffer(1);
            fs.read(fd,buff,0,buff.length,position,function(err, bytesRead:number,buffer:Buffer){
                buffer[0]++;
                fs.write(fd,buffer,0,buffer.length,position,function(err, written:number,buffer:Buffer){
                    fs.close(fd,function(err){
                        console.log(`${file} Hash Modified.`);
                    });
                });
            })
        })
    });
};

/**
 * 判断file是不是视频文件
 * @param file 文件路径.
 * @return 是否是视频文件
*/
function isValidFile(file:string){
    let re = /(.mkv|.mp4|.avi|.rmvb)$/;
    return re.test(path.extname(file).toLowerCase());
}
if(isValidFile(filePath)){
    modifyVideoHash(filePath);
}
else{
    wl.forEachFile(filePath,function(file:string){
        if(isValidFile(file)){
            modifyVideoHash(file);
        }
    });
}






