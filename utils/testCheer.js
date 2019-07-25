/** 
 * 在笔趣阁上搜书的连接，下载并打包成txt书籍
*/
var request = require("request");
var cheerio = require('cheerio');

var fs = require("fs");
var wl = require("./file");


function biqugeSearch(name, cb) {
    let encodeName = encodeURIComponent(name);
    let url = `http://zhannei.baidu.com/cse/search?q=${encodeName}&click=1&entry=1&s=11297026388358900920&nsid=`;
    console.log(url);
    let books = [];
    request(url, function (error, response, body) {

        if (response && response.statusCode == 200) {
            let $ = cheerio.load(body);
            $('.result-item').each((idx, elem) => {
                let book = {};

                book.title = $('.result-item-title a', "", elem).attr('title');
                book.url = $('.result-item-title a', "", elem).attr('href');
                book.img = $('img', "", elem).attr('src');
                let tags = {};
                let arrs = [];
                $('.result-game-item-info-tag', "", elem).each((idxTag, elemTag) => {
                    arrs[idxTag] = [];
                    $('span', "", elemTag).each((idxTagSub, elemTagSub) => {
                        arrs[idxTag][idxTagSub] = $(elemTagSub).text().replace(/\s+\s+/g, "");
                    });

                });
                for (var i = 0; i < arrs.length; ++i) {
                    tags[arrs[i][0]] = arrs[i][1];
                }
                book.tags = tags;
                books.push(book);
            });


        }
        cb(books);
    });
}



function qj2bj(str){  
    var tmp = "";  
    for(var i=0;i<str.length;i++){  
        if(str.charCodeAt(i) >= 65281 && str.charCodeAt(i) <= 65374){// 如果位于全角！到全角～区间内  
            tmp += String.fromCharCode(str.charCodeAt(i)-65248)  
        }else if(str.charCodeAt(i) == 12288){//全角空格的值，它没有遵从与ASCII的相对偏移，必须单独处理  
            tmp += ' ';  
        }else{// 不处理全角空格，全角！到全角～区间外的字符  
            tmp += str[i];  
        }  
    }  
    return tmp.toLowerCase();  
} 

function biqugePage(url, cb) {
    request(url, function (error, response, body) {
        if (response && response.statusCode == 200) {
            let $ = cheerio.load(body);
            let content = $('div #content');
            let children = content[0].children;
            let text = [];
            for (let i = 0; i < children.length; ++i) {
                let child = children[i];
                if (child.type == "text") {
                    let tmp = qj2bj(child.data.replace(/.笔.*趣.*阁/,""));
                    if(!/^\s+w.+/.test(tmp)){
                        
                        text.push(tmp.replace(/www\.biquke\.com./,""));
                    }
                    else{
                        text.pop();
                    }

                }
                else {
                    text.push("\n");
                }

            }
            cb(text.join(""));
        }
        else{
            console.log("res pont error",error);
            biqugePage(url,cb);
        }
    });
}

function biqugeDownload(url, saveDir, cb) {
    wl.createFolders(saveDir);
    request(url, function (error, response, body) {
        if (response && response.statusCode == 200) {
            let $ = cheerio.load(body);
            let nameStart = 10000;
            let num = $('dd a').length;
            let total = num;
            let searchStarted = 0;
            console.log("开始下载",num);
            let testFinish = function(){
                num--;
                console.log("进度",searchStarted,num,total,Math.floor((total-num)/total*100)+"%");
                if(num <= 0){
                    cb();
                }
            }
            
            $('dd a').each((idx, elem) => {
                let name = $(elem).attr("title");
                let page = url + $(elem).attr("href");
                name = name.replace("?","");
                name = name.replace("*","");
                name = name.replace("*","");
                name = name.replace("**","");
                let fileName = saveDir+"/"+(nameStart+parseInt(idx))+name+".txt";
                if(fs.existsSync(fileName)){
                    testFinish();
                    return;
                }
                searchStarted++;
                biqugePage(page, (text) => {
                    
                    
                    let chapter = "\n"+name + "\n"+text;
                    fs.writeFileSync(fileName,chapter);
                    testFinish();
                });
            });
        }
    });
}


function packTxt(dir,outFile){
    let fd = fs.openSync(outFile,"w");
    wl.forEachFile(dir,function(file){
        console.log(file);
        fs.writeSync(fd,fs.readFileSync(file).toString());
        
    });
    fs.closeSync(fd);
}



function start(name){
    let outDir = "./books/"+name;
    biqugeSearch(name,function(books){
        if(books[0].title != name){
            console.log("没找到");
            return;
        }
        console.log("开始下载");
         biqugeDownload(books[0].url, outDir, function (cur, total) {
            packTxt(outDir,outDir+".txt");
            console.log("整理完毕");
         });
        
    });
}

 start("伏天氏");