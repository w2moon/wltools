/** 
 * 在笔趣阁上搜书的连接，下载并打包成txt书籍
*/
var request = require("request");
var cheerio = require('cheerio');
var sanitize = require("sanitize-filename");
var fs = require("fs");
var wl = require("./file");
var ec = require('encoding_convertor');
var iconv = require('iconv-lite');
// var urlHead = "https://www.yangguiweihuo.com";
var urlHead = "https://www.biquge.cc/html/457/457697/";
function biqugeSearch(name, cb) {
    let encodeName = encodeURIComponent(name);
    let url = urlHead+`/s.php?ie=gbk&q=${encodeName}`;
    console.log(url);
    let books = [];
    request.get(url, {encoding:null},function (error, response, body) {

        if (response && response.statusCode == 200) {
            let txt = iconv.decode(body,'GBK');
            let $ = cheerio.load(txt);
            $('.bookbox').each((idx, elem) => {
                let book = {};

                book.title = $('.bookname a', "", elem).text();
               
                book.url = urlHead+$('.bookname a', "", elem).attr('href');
                book.img = urlHead+$('img', "", elem).attr('src');
                let tags = {};
                let arrs = [];
               
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
let idx = 0;
let wait = [];
function biqugePage(url, cb) {
    // wait.push(()=>{
        request(url,{encoding:null}, function (error, response, body) {
            if (response && response.statusCode == 200) {
                let txt = body;//iconv.decode(body,'GBK');
                let $ = cheerio.load(txt);
                let content = $('div #content');
                let children = content[0].children;
                let text = [];
                for (let i = 0; i < children.length; ++i) {
                    let child = children[i];
                    if (child.type == "text") {
                        if(child.data.indexOf("请记住本书首发域名")!=-1){
                            continue;
                        }
                        let tmp = qj2bj(child.data.replace(/.笔.*趣.*阁/,"").replace(url,""));
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
                if(error){
                    console.log("error",error);
                }
                else if(response){
                    console.log("ss",response.statusCode,url);
                }
                else{
                    console.log("unknown error");
                }
                
                biqugePage(url,cb);
            }
            setTimeout(nextWait,1);//0+Math.random()*10);
        });
    // });
       
}

function nextWait(){
    if(wait.length <= 0){
        return;
    }
    let a = wait.pop();
    a();
}

function biqugeDownload(url, saveDir, cb) {
    wl.createFolders(saveDir);
    request(url,{encoding:null}, function (error, response, body) {
        if (response && response.statusCode == 200) {
            let txt = body;//iconv.decode(body,'GBK');
            let $ = cheerio.load(txt);
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
                
                paged = true;
                let name = $(elem).text();
                let page = urlHead + $(elem).attr("href");
                // name = name.replace("?","");
                // name = name.replace("*","");
                // name = name.replace("*","");
                // name = name.replace("**","");
                let fileName = saveDir+"/"+(nameStart+parseInt(idx))+name+".txt";
                // let fileName = saveDir+"/"+(nameStart+parseInt(idx))+sanitize(name)+".txt";
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
            nextWait();
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
    // biqugeSearch(name,function(books){
        // if(books[0].title != name){
        //     console.log("没找到");
        //     return;
        // }
        console.log("开始下载");
       // var url = books[0].url;
        // var url = "https://www.yangguiweihuo.com/14/14539";
        var url = urlHead;
        
         biqugeDownload(url, outDir, function (cur, total) {
            packTxt(outDir,outDir+".txt");
            console.log("整理完毕");
         });
         
        
    // });
}

 start("听说我死后超凶的");