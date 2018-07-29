require("../utils/patch");
var URL = "http://139.162.109.58:8666/";
var http = require("http");
var path = require("path");
var fs = require("fs");
var wl = require("../utils/file");
var arg = process.argv.splice(2);

var processURL = function(name,cb){
    var testStr = path.basename(name).replace("SIS001","").replace("sis001","");
    var t = /([a-zA-Z]+[\-\_]*\d\d+)/gi.exec(testStr);

    if(!t){
        
        testStr = name.replace("SIS001","").replace("sis001","");
         t = /([a-zA-Z]+[\-\_]*\d\d+)/gi.exec(testStr);
         if(!t){
            console.log("not found name",name);
            cb();
            return;
         }
        
    }
    var idx = name.indexOf(t[0]);
    var sub = name.substr(idx+t[0].length);
    idx= sub.indexOf(t[0]);
    var tail = "";
    if(idx != -1){
        sub = sub.substr(idx+t[0].length);
    }
    var tsub = /^([\w_]+)/gi.exec(sub);
    
    if(tsub){
        tail = tsub[0];
        console.log("has tail:",tail);
    }
    var code = t[0].toUpperCase();
    code = code.replace("_","");
    code = code.replace("-","");
    console.log(URL+code,name);
    
    http.get(URL+code,function(res){
        if (res.statusCode !== 200) {
            cb();
            return;
        } 
        

        res.setEncoding('utf8');
        var rawData = '';
        res.on('data', function(chunk) { rawData += chunk; });
        res.on('end', function()  {
            try {
            var parsedData = JSON.parse(rawData);
            parsedData.code = code;
            parsedData.tail = tail;
            cb(parsedData);
            } catch (e) {
            console.error(e.message);
            cb();
            }
        });
    })
}

function processFile(name,cb){
    processURL(name,function(data){
        if(!data || !data.imgs){
            console.log("not found data");
            cb();
        }
        else{
            if(data.title.length>40){
                data.title = "";
            }
            console.log("save found data");
            var newFileName = data.title+data.tail+"("+data.code+")";
            var dir = path.dirname(name);
            var bn = path.basename(name);
            fs.renameSync(name,dir+"/"+newFileName+path.extname(name));
            
            fs.writeFileSync(dir+"/"+newFileName+".jpg",Buffer.from(data.imgs, 'base64'));
            cb();
        }
    });
}

var validExts = [".mp4",".mkv",".avi",".rmvb",".rm",".iso"];
function isValidExt(ext){
    var e = ext.toLowerCase();
    if(validExts.indexOf(e) != -1){
        return true;
    }
    return false;
}

var needToUnlink = [];
var toProcess = [];
wl.forEachFile(arg[0],function(file){
    var ext = path.extname(file);
    if(!isValidExt(ext)){
        if(ext != ".jpg"){
            //remove
            needToUnlink.push(file);
        }
        
        return;
    }
    else if(!arg[1]){
        //check exist
        if(fs.existsSync(file.replace(ext,".jpg"))){
            return;
        }

    }
    toProcess.push(file);
    //processFile(file);
});

for(var i=0;i<needToUnlink.length;++i){
    fs.unlinkSync(needToUnlink[i]);
}

if(toProcess.length > 0){
    var stackCall = function(idx){
        processFile(toProcess[idx],function(){
            idx++;
            if(idx<toProcess.length){
                stackCall(idx);
            }
        });
    }
    stackCall(0);
    
}
