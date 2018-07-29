

//https://javhip.com/cn/search/avop%20236

/*
<a class="movie-box" href="https://javhip.com/cn/movie/5oei">
<div class="photo-frame">
<img src="https://jp.netcdn.space/digital/video/1avop00236/1avop00236ps.jpg" title="マジックミラー号 職場の同僚とMM号で2人っきり 同じオフィスで働く男女に突然のSEX交渉！12人8時間！人生初の真正中出しスペシャル">
</div>
<div class="photo-info">
<span>マジックミラー号 職場の同僚とMM号で2人っきり 同じオフィスで働く男女に突然のSEX交渉！12人8時間！人生初の真正中出しスペシャル  <i class="glyphicon glyphicon-fire" style="color:#cc0000"></i><br><date>AVOP-236</date> / <date>2016-09-01</date></span>
</div>
</a>

*/

/*
<a class="bigImage" href="https://jp.netcdn.space/digital/video/1avop00236/1avop00236pl.jpg" title="AVOP-236 マジックミラー号 職場の同僚とMM号で2人っきり 同じオフィスで働く男女に突然のSEX交渉！12人8時間！人生初の真正中出しスペシャル"><img src="https://jp.netcdn.space/digital/video/1avop00236/1avop00236pl.jpg"></a>
*/
var request = require("request");
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var http = require('http');
var net = require('net');
var url = require('url');
var getImgData = function(url,cb){
    var name = path.basename(url);
    request.get(url).on('complete',function(){
        var data = fs.readFileSync(name);
        cb(data);
    }).on('error',function(){
        console.log("get img data error",url);
    }).pipe(fs.createWriteStream(name));
};

var fetch = function(name,cb){
    request("https://javhip.com/cn/search/"+name,function(error,response,body){
    
        if(response && response.statusCode == 200){
            var $ = cheerio.load(body);
            var found = false;
            $('.movie-box').each(function (idx, element) {
                var $element = $(element);
                var title = $('div img',"",element).attr('title');
                var imgs = $('div img',"",element).attr('src');
                var imgb = imgs.replace("s.jpg","l.jpg"); 
                if(found){
                    return;
                }
                found = true;
                getImgData(imgs,function(datas){
                    getImgData(imgb,function(datab){
                        cb(title,datas,datab);
                    });
                    
                });

            });
            if(!found){
                cb(name,"","");
            }
            else{
                return;
            }
        }
        else{
            if(error){
                console.log("fetch",error);
            }
            else if(response){
                console.log("response",response.statusCode);
            }
            cb(name,"","");
        }
        

    });
}

http.createServer(function(req,res){
    if(req.url.indexOf("favicon") != -1){
        res.end();
        return;
    }
   var name = req.url.substr(1);
   if(fs.existsSync(name)){
       res.write(fs.readFileSync(name).toString());
       res.end();
       return;
   }
   fetch(name,function(title,imgs,imgb){
       console.log("fecthed",title);
    var ret = {
        title:title,
        imgs:imgs.toString('base64'),
        imgb:imgb.toString('base64'),
    };
    fs.writeFileSync(name,JSON.stringify(ret));
    res.write(JSON.stringify(ret));
    res.end();
   
});
    
}).listen(8666);


/*
fetch("avop%20236",function(title,imgs,imgb){
    var ret = {
        title:title,
        imgs:imgs.toString('base64'),
        imgb:imgb.toString('base64'),
    };
   
});
*/


