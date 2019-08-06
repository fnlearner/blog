---
title: JavaScript读书笔记
date: 2019-8-5 10:36:13
tags:
---

## new运算符的实现

### 定义一个函数，以及原型链的方法

``` bash
function Testfoo(name) {
    console.log(this[name]) 
};

Testfoo.prototype.sayHello= function(){
    console.log('hello');
    return 1;
}
//使用new运算符
let aaa = new Testfoo();
aaa.sayHello();//输出hello
//不使用new运算符
let testObj  = {};//创建空对象
testObj=Object.create(Testfoo.prototype);//创建一个具有Testfoo的原型链的空方法
Testfoo.call(testObj);//指定this
console.log('testObj',testObj.sayHello());//输出hello
```

## call和bind实现

### call

``` bash
Function.prototype.myCall = function(ctx, ...argv) {
	ctx = typeof ctx === 'object' ? ctx || global : {} // 当 ctx 是对象的时候默认设置为 ctx；如果为 null 则设置为 window 否则为空对象
	const fn = Symbol('fn')
	ctx[fn] = this
	ctx[fn](...argv)
        delete ctx[fn]
}
let objCall = { fn: 'functionName', a: 10 };
Testfoo.myCall(objCall, 'a');//输出10
```
ctx代表当前对象，this指针指向的是调用该方法的函数，将this指针指向的方法的引用地址赋值给当前对象内的fn字段。然后调用方法，这样this指针指向的方法的内部this指针的指向就是当前对象，这样就可以实现了this指针的绑定，
### bind

``` bash
Function.prototype.myBind=function(ctx,...arg1){
    return (...arg2)=>{
        return this.call(ctx,...arg2,...arg1)
    }
}
let obj2={a:1};
function addTwoNum(x,y){
    console.log(x+y,this.a);
}
addTwoNum.myBind(obj2,2)(2);//4 1;
addTwoNum.myBind(obj2,2,2)();//4 1
addTwoNum.myBind(obj2)(2,2);//4 1
```

## 迭代器iterator

iteraotr接口部署在Symbol.iterator上，一些内置类型拥有默认的迭代器行为，其他类型（如 Object）则没有。下表中的内置类型拥有默认的@@iterator方法：

```
Array.prototype[@@iterator]
TypedArray.prototype[@@iterator](
String.prototype[@@iterator]
Map.prototype[@@iterator]
Set.prototype[@@iterator]
```

遍历接口可以是这样

```
function DiyIterator(){
    var arr=[1,2,3];
    var it=arr[Symbol.iterator]();

    for(var v,res;(res=it.next())&&!res.done;){
        v=res.value;
        console.log(v);
    } 
}
```
或者这样

```
function DiyIterator(){
    var arr=[1,2,3];
   for(let item of arr){
       console.log(item);//1,2,3
   }
}
```
String, Array, TypedArray, Map and Set 是所有内置可迭代对象， 因为它们的原型对象都有一个 @@iterator 方法.Object没有部署iterator接口，所以当执行这样的语句时，就会报错
![图片alt](https://user-gold-cdn.xitu.io/2019/6/27/16b998bea55f3d96?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

遍历对象可以用for..in..(for...in语句以任意顺序遍历一个对象自有的、继承的、可枚举的、非Symbol的属性。对于每个不同的属性，语句都会被执行。),或者用Object.entries(),Object.keys(),Object.values(),或者可以自己实现一个iterator接口，然后就成了这样

```
function seriesIterator(){
    let task={
        [Symbol.iterator](){
            var steps=this.action.slice();
            return {
                [Symbol.iterator](){return this},
                next(...args){
                    if(steps.length>0){
                        //为存放function的数组部署iterator接口
                        let res=steps.shift()(...args);
                        console.log(res);
                        return {
                            value:res,done:false
                        }
                    }else{
                        return {done:true};
                    }
                },
                return(v){
                    steps.length=0;
                    return {value:v,done:true};
                }
            };
        },
        action:[]
    };

    task.action.push(
        function step1(x){
            console.log('step 1:',x);
            return x*2;
        },
        function step2(x,y){
            console.log(`step 2 ${x} ${y}`);
            return x+(y*2);
        },
        function step3(x,y,z){
            console.log(`step 3 ${x} ${y} ${z}`);
            return (x*y)+z;
        }
    )

    let it=task[Symbol.iterator]();

    it.next(10);
    it.next(10,10);
}
```
![图片](https://user-gold-cdn.xitu.io/2019/6/27/16b99940ab1c985c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

根据MDN文档，如果一个迭代器 @@iterator 没有返回一个迭代器对象，那么它就是一个不符合标准的迭代器，这样的迭代器将会在运行期抛出异常，甚至非常诡异的 Bug。所以 需要返回this，next就是具体的逻辑，科科~

## 扁平化

### 第一种就是常见的递归

```
let arr=[1,2,3,[3,2,1,[1,2,3]]];
const bianpinghua1= arr =>{
    return arr.reduce((sum,cur)=>{
        return sum.concat(Array.isArray(cur)?bianpinghua1(cur):cur);
    },[])
}
const testArr = bianpinghua1(arr)//[ 1, 2, 3, 3, 2, 1, 1, 2, 3 ]

```

### 第二种用es6的generator

```
function*  bianpinghua(arr){ 
    if(Array.isArray(arr)){
        for(let i of arr){
            yield* bianpinghua(i);
        }
    }else
        yield arr;
}
for(let i of bianpinghua(arr)){
    console.log(i)
}

```

### 第三种用es6+(我也不知道具体哪个时候出的api)的flat

```
    let arr =[1,2,[3,4]];
    let temp =arr.flat(Infinity);
    console.lg(temp);//[1,2,3,4]
```


##  var  let const 

### var

var声明的变量支持变量提升，提升到当前作用域的顶层，level低于函数声明式

```
function test(){
    console.log(name);
    var name ='Jack';
}
```
这样输出的name是undefined，var name = 'Jack' 在解析器中分为var name ; name = 'Jack' 两步，而var的变量提升了var name;所以上述代码在解析器中的眼里是这样的

```
function test(){
    var name;
    console.log(name);
    name='Jack';
}

```
### let const
let 和 const 声明的变量不会像var一样造成变量提升,let 和const 声明的变量只有在声明之后才能使用, let声明的变量会造成TDZ(暂时性死区)，在声明变量之前调用会抛出错误 ReferenceError
const 声明的变量不允许重新赋值，但是允许修改引用地址

```
  const tempObj ={
      a :1
  }
  console.log(tempObj);//{a:1}
  tempObj.a=2;
  console.log(tempObj)//{a:2}
```
可以选择使用Object.freeze()来冻结
```
  const tempObj ={
      a :1
  }
  Object.freeze(tempObj)
  console.log(tempObj);//{a:1}
  tempObj.a=2;
  console.log(tempObj)//{a:1}
```

##  事件循环

### event loop

   在JS里有两类任务，一种是同步任务，一种是异步任务，其中异步任务又含有宏任务(Macrotasks)和微任务(Microtasks )，setTimeout setInterval setImmediate
I/O UI渲染 就是异步任务中宏任务的典型代表,而微任务中的代表是Pormise,在JS执行顺序中，最先执行的是同步任务，接着是异步任务中的微任务，再接着是宏任务，微任务和宏任务的是放在不同的执行队列中，只有微任务执行完了才会执行开始调用宏任务

```
  function test(){
      console.log(2);
  }
  console.log(1);
  test();
  setTimeout(()=>{
      console.log(3);
  })
  new Promise((resolve,rejected)=>{
      resolve(4);
      console.log(6);
  }).then(res=>{
      console.log(res);
  })
// 1 2 6 4 3
```
console.log(1)和test 均属于同步任务，所以他们两个最先执行，输出1，2 ，setTimeou和promise均属于异步任务，因此它们都被推到全局API中的任务队列中等待执行栈中的任务执行完毕，等执行栈中的任务执行完毕时，就执行microTask queue中的微任务，等微任务执行完成时，再去寻找macroTask queue中是否还有寻找执行的宏任务；对promise来说 new Promise()里面的程序是属于同步任务的,而pormise的then方法才是属于异步任务中的微任务。

##  数组常见方法的使用

### map
map() 方法创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。
```
function extractId(data){
    return data.map(item=>item.id);
}
let arr =[
    {
        id:1,
        name:'Tom',
        age:1
    },
    {
        id:2,
        name:'Jack',
        age:2
    }
]
console.log(extractId(arr));//[1,2]


function extractIdAndAge(data){
    return data.map(item=>[item.id,item.age]);
}
let arr =[
    {
        id:1,
        name:'Tom',
        age:2
    },
    {
        id:2,
        name:'Jack',
        age:1
    }
]

console.log(extractId(arr));//[ [ 1, 2 ], [ 2, 1 ] ]
```
### filter

filter() 方法创建一个新数组, 其包含通过所提供函数实现的测试的所有元素。filter方法返回的元素的boolean值为真
```
function test(data){
    return data.filter(item=>item)
}
let arr =[
    undefined,null,NaN,0,false,'',1
]
console.log(arr)//1
因为undefined,null, NaN , 0 ,false ，''转为boolean值后均为false
```
### every,some

every() 方法测试一个数组内的所有元素是否都能通过某个指定函数的测试。它返回一个布尔值。若收到一个空数组，此方法在一切情况下都会返回 true。every遍历的数组的每个元素都需要满足判断条件

```
function test(data){
    return data.every(item=>item>1)
}
let arr =[
    2,3,4,0,0,1,1,null,undefined
]
console.log(test(arr))//false，因为0<1,null 和undefined与数字比较时会转成数字0
let arr1= [
    2,3,4,5,6,7,8
]
console.log(test(arr1));//true 
```
some() 方法测试是否至少有一个元素可以通过被提供的函数方法。该方法返回一个Boolean类型的值。只要一个符合条件，就返回true
```
function test(data){
    return data.some(item=>item>1)
}
let arr =[
    2,3,4,0,0,1,1,null,undefined
]
console.log(test(arr))//true
```
### splice、slice

splice() 方法通过删除或替换现有元素或者原地添加新的元素来修改数组,并以数组形式返回被修改的内容。此方法会改变原数组。
splice(startNumber,deleteCount,...item)
```
let arr=[1,2,3];
arr.splice(0,1);//arr->[2,3]

arr.splice(0,0,1);//arr->[ 1, 2, 3, 4, 5, 6, 7, 8 ]
```
slice() 方法返回一个新的数组对象，这一对象是一个由 begin 和 end 决定的原数组的浅拷贝（包括 begin，不包括end）。原始数组不会被改变。不给slice添加参数时默认返回所有元素

```
let arr1= [
    2,3,4,5,6,7,8
]
let temp =arr1.slice(0,2)
console.log(temp,arr1);//[ 2, 3 ] [ 2, 3, 4, 5, 6, 7, 8 ]
```
### push pop shift unshift 

pop 返回数组最后一个元素，改变原数组
shift 返回数组第一个元素，改变原数组
push  向数组的末尾添加元素
unshift 向数组的头部添加元素

### includes indexof lastIndexOf
includes() 方法用来判断一个数组是否包含一个指定的值，根据情况，如果包含则返回 true，否则返回false。
```
let arr = [1,2,3];
console.log(arr.includes(1))//true
```
indexOf()方法返回在数组中可以找到一个给定元素的第一个索引，如果不存在，则返回-1。
lastIndexOf与此类似，返回给定元素的最后一个索引
```
let arr =[1,2,3,1];
console.log(arr.indexOf(1))//0
console.log(arr.lastIndexOf(2))//3
console.log(arr.indexOf(4))//-1
```


## 类型转换

类型转换有两种，要么是显示类型转换，要么是隐式类型转换
### 显示类型转换见[W3C](https://www.w3school.com.cn/js/js_type_conversion.asp)
-------
### 隐式类型转换常见于运算符比较隐式转换，参考[ES规范](http://yanhaijing.com/es5/#199)11.9.3
-----------
    若Type(x)与Type(y)相同， 则
    若Type(x)为Undefined， 返回true。
    若Type(x)为Null， 返回true。
    若Type(x)为Number， 则
    若x为NaN， 返回false。
    若y为NaN， 返回false。
    若x与y为相等数值， 返回true。
    若x 为 +0 且 y为−0， 返回true。
    若x 为 −0 且 y为+0， 返回true。
    返回false。
    若Type(x)为String, 则当x和y为完全相同的字符序列（长度相等且相同字符在相同位置）时返回true。 否则， 返回false。
    若Type(x)为Boolean, 当x和y为同为true或者同为false时返回true。 否则， 返回false。
    当x和y为引用同一对象时返回true。否则，返回false。
    若x为null且y为undefined， 返回true。
    若x为undefined且y为null， 返回true。
    若Type(x) 为 Number 且 Type(y)为String， 返回comparison x == ToNumber(y)的结果。
    若Type(x) 为 String 且 Type(y)为Number，
    返回比较ToNumber(x) == y的结果。
    若Type(x)为Boolean， 返回比较ToNumber(x) == y的结果。
    若Type(y)为Boolean， 返回比较x == ToNumber(y)的结果。
    若Type(x)为String或Number，且Type(y)为Object，返回比较x == ToPrimitive(y)的结果。
    若Type(x)为Object且Type(y)为String或Number， 返回比较ToPrimitive(x) == y的结果。
    返回false。
```
[]==![]
//等式右边的显然是显示转换，根据规则，所有对象或数组的boolean总是为true,那么取反也就是false,那么等式就变成[]==false,接下来是等式的隐式类型转换，明显等式左边的是一个数组，那么就调用它的ToPrimitive方法，返回''，因此等式变成''==false，
//接着进行基本类型转换,''->0,false->0，最后等式变成0==0，所以结果是true
1=='1'//true
1==null//fasle
1==undefined//false
1==true//true
1==[]//false
{}==0//Unexpected token ==,这是因为AST把第一个{}不是解析成对象，而是解析成一个block(代码块),因此其实等式左边是没有值的，因此抛出一个异常,有疑问自行google AST explorer
0=={}//true
{}+1==1//true ,对于加法运算，JS会把运算符两侧的对象调用toPrimitive方法，因此等式变成''+1==1->'1'==1->1==1
```

## 总结

更新中...