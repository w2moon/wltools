//重新打包图片
import * as fs from 'fs';


/** 图片信息 */
interface ImageInfo{
    /** 图片路径 */
    path:string,
};

/** 每个文件的图片使用信息 */
interface FileInfo{
    
    /** 文件路径 */
    path:string,

    /** 文件使用到的所有图片信息 */
    images:Array<ImageInfo>,

};

/** 所有文件集合 */
interface FileCollection{

    /** 集合 */
    [index:number]:FileInfo,
};


let ii:ImageInfo;
