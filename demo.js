Array.prototype.myReduce = function(fn,initialValue){
    const arr = this
    const [begin]  = arr
    let pre = initialValue || begin
    
    const startIndex = initialValue === void 0 ? 1:0
    for(let i = startIndex; i < arr.length;i++){
        pre = fn(pre,arr[i])
    }    
    return pre
}
const sum1 = [1,2,3,4].myReduce((pre,cur)=>pre+cur)
const sum2 = [1,2,3,4].myReduce((pre,cur)=>pre+cur,2)

// console.log(sum1)
// console.log(sum2)
function _instanceof(a,b){
  while(a){
      if(a.__proto__ === b.prototype){
          return true
      }else{
          a = a.__proto__;
      }
  return false;
  }
}
console.log(_instanceof([],Array));
console.log(_instanceof(1,Array));
console.log(_instanceof({},Object));

