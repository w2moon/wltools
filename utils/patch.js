Object.prototype.startsWith = function(str){
    
      return new RegExp("^"+str).test(this);
};
Object.defineProperty(Object.prototype, "startsWith", { writable: true, enumerable: false, configurable: true });

Object.prototype.endsWith = function(str){
   
      return new RegExp(str+"$").test(this);
};
Object.defineProperty(Object.prototype, "endsWith", { writable: true, enumerable: false, configurable: true });
