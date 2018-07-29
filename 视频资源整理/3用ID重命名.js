var wl = require("./tools/file");
var path = require("path");
var fs = require("fs");

function newName(name){
    var oldn = name;
    name = name.replace("SIS001","").replace("sis001","");
    var t = /([a-zA-Z]+[\-\_]*\d\d+)/gi.exec(name);
    if(!t){
        name = name.replace("SIS001","").replace("sis001","");
        t = /([a-zA-Z]+[\-\_]*\d\d+)/gi.exec(name);
        if(!t){
            console.log("no sig number found",oldn);
            return oldn;
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
    var ext = path.extname(name);
    return "("+code+")" +ext.toLowerCase();
}
var files = [];
wl.forEachFile("./ttt/",function(file){
    var name = path.basename(file);
    var newPath = path.dirname(file)+"/"+newName(name);
    
    if(newPath == file){
        return;
    }
    
    files.push({
        old:file,
        new:newPath,
    });

    console.log(newPath);
    
});

for(var i=0;i<files.length;++i){
    //fs.renameSync(files[i].old,files[i].new);
}
