var fs = require('fs');
var parsePlist = require('fast-plist').parse;
var indentString = function(indent){
    var str = "";
    for(var i=0;i<indent;++i){
        str += "\t";
    }
    return str;
};
var writeKey = function(fd,key,indent){
    fs.writeSync(fd,indentString(indent)+"<key>"+key+"</key>\n");  
};

var writeValue = function(fd,obj,indent){
    var typ = typeof(obj);
    if(typ == "string"){
        fs.writeSync(fd,indentString(indent)+"<string>"+obj+"</string>\n");  
    }
    else if(typ == "number"){
        if(Number.isInteger(obj)){
        fs.writeSync(fd,indentString(indent)+"<integer>"+obj+"</integer>\n");  

        }
        else{
        fs.writeSync(fd,indentString(indent)+"<real>"+obj+"</real>\n");  

        }
    }
    else if(typ == "boolean"){
        if(obj){
            fs.writeSync(fd,indentString(indent)+"<true/>\n");
        }
        else{
            fs.writeSync(fd,indentString(indent)+"<false/>\n");
        }
    }
    else if(typ == "object"){
        if(obj instanceof Array){
            writeArray(fd,obj,indent);
        }
        else{
            writeDict(fd,obj,indent);
        }
    }
};

var writeArray = function(fd,obj,indent){
    if(obj.length <= 0){
        fs.writeSync(fd,indentString(indent)+'<array/>\n');
        return;
    }
    fs.writeSync(fd,indentString(indent)+'<array>\n');
    indent++;
    for(var i=0;i<obj.length;++i){
        writeValue(fd,obj[i],indent);
    }
    indent--;
    fs.writeSync(fd,indentString(indent)+'</array>\n');
};


var writeDict = function(fd,obj,indent){
    fs.writeSync(fd,indentString(indent)+'<dict>\n');
    indent++;
    for(var k in obj){
        writeKey(fd,k,indent);
        writeValue(fd,obj[k],indent);
    }
    indent--;
    fs.writeSync(fd,indentString(indent)+'</dict>\n');
};


var write = function(file,obj){
    var fd = fs.openSync(file,"w");
    //write head
    fs.writeSync(fd,'<?xml version="1.0" encoding="UTF-8"?>\n');
    fs.writeSync(fd,'<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n');  
    fs.writeSync(fd,'<plist version="1.0">\n');
    writeDict(fd,obj,1);
    //write foot
    fs.writeSync(fd,'</plist>\n');

    fs.closeSync(fd);
};
var read = function(file){
    return parsePlist(fs.readFileSync(file,'utf-8'));
}
module.exports = {
    write:write,
    read:read,
};
var parsePlist = require('fast-plist').parse;
var obj = parsePlist(fs.readFileSync("../resTest/meatTailing.plist",'utf-8'));
write("../resMin/meatTailing.plist",obj);