var XLSX = require("xlsx");
/*
options = {
	splitToken:";",//分隔符
	forceString:true,//强制用string类型
}
*/
function excelToIDJson(filename,options) {
	var options = options || {};
	var wb = XLSX.readFile(filename);
	var ws = wb.Sheets[wb.SheetNames[0]];
	var arr = XLSX.utils.sheet_to_json(ws, {header:1, raw:!options.forceString})

	var obj = {};
	var header = null;
	for(var i=0;i<arr.length;++i){
		if(!header){
			header = arr[0];
			continue;
		}
		var subobj = arr[i];

		var idxStart = 1;
		var id = subobj[0];
		if(id === undefined){
			continue;
		}
		var parentObj = obj;
		if(obj[id]){
			idxStart = 2;
			parentObj = obj[id];
			if(!parentObj._s){
				var oldSubMap = {};
				var oldId = parentObj[header[1]];
				for(var k in parentObj){
					if(k != header[1]){
						oldSubMap[k] = parentObj[k];
					}
				}
				
				parentObj = {_s:true};
				parentObj[oldId] = oldSubMap;
				obj[id] = parentObj;
			}
			id = subobj[1];
			
		}
		var temp = {};
		for(var j=idxStart;j<subobj.length;++j){
			if(subobj[j] === undefined && options.forceString){
				temp[header[j]] = "";
			}
			else{
				var v = subobj[j];
				if(options.splitToken && v.indexOf(options.splitToken) != -1){
					v = v.split(options.splitToken);
					for(var m=0;m<v.length;++m){
						var fv = parseFloat(v[m]);
						if(fv){
							v[m] = fv;
						}
						
					}
				}
				temp[header[j]] = v;
			}
			
		}
		parentObj[id] = temp;
	}

	return obj;
}

module.exports = {
	excelToIDJson,
	
};