---
title: JavaScript读书笔记
date: 2019-8-5 10:36:13
tags: JavaScript
categories: JavaScript
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
<!-- more -->
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
![图片](https://user-gold-cdn.xitu.io/2019/6/27/16b998bea55f3d96?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

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
## 闭包

JS中对闭包的解释是在函数中调用另一个函数
```
function test(a){
    return function inner(){
        return ++a;
    }
}
let a = 2;
const testVim = test(a);//testVim 在没有销毁时始终占有function inner的内存地址

console.log("testVim:", testVim());//3
console.log("testVim:", testVim());//4
console.log("testVim:", testVim());//5
```

```
function makeSizer(size) {
  return function() {
    document.body.style.fontSize = size + 'px';
  };
}

var size12 = makeSizer(12);
var size14 = makeSizer(14);
var size16 = makeSizer(16);
```
size12，size14 和 size16 三个函数将分别把 body 文本调整为 12，14，16 像素。我们可以将它们分别添加到按钮的点击事件上。如下所示：
```
document.getElementById('size-12').onclick = size12;
document.getElementById('size-14').onclick = size14;
document.getElementById('size-16').onclick = size16;
```
```
<a href="#" id="size-12">12</a>
<a href="#" id="size-14">14</a>
<a href="#" id="size-16">16</a>
```

## 统计同一个字符串中出现次数最多的字符

### 正则

用正则匹配，\w可以用.代替
```
let str ='aaaaaaaabbbbbccccccccccccc';
let getMaxCount = (str)=>{
    const reg = /(\w)\1+/g;
    const result = str.match(reg);
    let finalResult = result.map(item=>{
        return {
            length:item.length,
            item:item[0]
        }
    }).sort((a,b)=>{
        return a.length-b.length<0
    });
    // console.log(finalResult)
    return finalResult[0];
}
getMaxCount(str);
```
### reduce
```
let getMaxCount_2 = (str)=>{
    let temp = str.split("");
    let result  = temp.reduce((obj,cur)=>{
        obj[cur] = ++obj[cur]||1;
        return obj;
    },{});
    let max = {
        len:0,
        item:''
    };
    for(let index in result){
        if(result[index]>max.len){
            max.len = result[index];
            max.item = index;
        }
    }
    return max;
}
getMaxCount_2(str);

```
## 数组去重

```
const isUnique = (arr)=>{
    const equals = (a, b) => {
        if (a === b) return true;
        if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
        if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) return a === b;
        if (a === null || a === undefined || b === null || b === undefined) return false;
        if (a.prototype !== b.prototype) return false;
        let keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length) return false;
        return keys.every(k => equals(a[k], b[k]));
      };
    
    for(let i =0;i<arr.length;i++){
        for(let j =i+1;j<arr.length;j++){
            if(!!equals(arr[i],arr[j])){
                arr.splice(j,1);
                j--;
            }
        }
    }
    return arr;
}
isUnique([123, [1, 2, 3], [1, "2", 3], [1, 2, 3], "meili",{a:1,b:1},{b:1,a:1}]);
```
## 数组转链表
```
/**
*链表节点
*param {*} val
*param {ListNode} next
**/
function ListNode(val,next=null){
    this.val = val;
    this.next = next;
}

/**
*将数组转为链表
*param {array} a
*param {ListNode} 
**/
const getListFromArray=a=>{
    let dummy = new ListNode()
    let pre =dummy;
    a.forEach(x => {
        return pre=pre.next=new ListNode(x);
    });
    return dummy.next;
}

/**
*将链表转为数组
*param {array} 
*param {ListNode} node 
**/
const getArrayFromList = index=>{
    let a=[];
    while(node){
        a.push(node.val);
        node = node.next;
    }
    return a;
}
```
## Map,Set,WeakMap,WeakSet

### Map
Map 对象保存键值对。任何值(对象或者原始值) 都可以作为一个键或一个值
new Map([iterable])
Iterable 可以是一个数组或者其他 iterable 对象，其元素为键值对(两个元素的数组，例如: [[ 1, 'one' ],[ 2, 'two' ]])。 每个键值对都会添加到新的 Map。null 会被当做 undefined

Objects 和 Maps 类似的是，它们都允许你按键存取一个值、删除键、检测一个键是否绑定了值。因此（并且也没有其他内建的替代方式了）过去我们一直都把对象当成 Maps 使用。不过 Maps 和 Objects 有一些重要的区别，在下列情况里使用 Map 会是更好的选择：

+ 一个Object的键只能是字符串或者 Symbols，但一个 Map 的键可以是任意值，包括函数、对象、基本类型。
+ Map 中的键值是有序的，而添加到对象中的键则不是。因此，当对它进行遍历时，Map 对象是按插入的顺序返回键值。
+ 你可以通过 size 属性直接获取一个 Map 的键值对个数，而 Object 的键值对个数只能手动计算。
+ Map 可直接进行迭代，而 Object 的迭代需要先获取它的键数组，然后再进行迭代。
Object 都有自己的原型，原型链上的键名有可能和你自己在对象上的设置的键名产生冲突。虽然 ES5 开始可以用 map = Object.create(null) 来创建一个没有原型的对象，但是这种用法不太常见。
+ Map 在涉及频繁增删键值对的场景下会有些性能优势。

```
let map = new Map([
[0,0];
]);
map.size;//1
for(let key of map.keys()){
    console.log(key)//0
}
for(let [key,value] of map.keys()){
    console.log(key,value)//0 0
}
for(let value of map.keys()){
    console.log(value)//0 0
}
map.clear()//清楚map对象所有键值对
map.delete(key)/*如果 Map 对象中存在该元素，则移除它并返回 true；否则如果该元素不存在则返回 false */
map.get(key)/*返回键对应的值，如果不存在，则返回undefined。*/
map.set(key,value);/*设置Map对象中键的值。返回该Map对象。*/
map.has(key)/*返回一个布尔值，表示Map实例是否包含键对应的值。*/
```

+ NaN 也可以作为Map对象的键。虽然 NaN 和任何值甚至和自己都不相等(NaN !== NaN 返回true)，但下面的例子表明，NaN作为Map的键来说是没有区别的:

```
var myMap = new Map();
myMap.set(NaN, "not a number");

myMap.get(NaN); // "not a number"


// 使用Array.from函数可以将一个Map对象转换成一个二维键值对数组
var kvArray = [["key1", "value1"], ["key2", "value2"]];
var myMap = new Map(kvArray);

console.log(Array.from(myMap)); // 输出和kvArray相同的数组
```

Map对象间可以进行合并，但是会保持键的唯一性

```
var first = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
]);

var second = new Map([
  [1, 'uno'],
  [2, 'dos']
]);

// 合并两个Map对象时，如果有重复的键值，则后面的会覆盖前面的。
// 展开运算符本质上是将Map对象转换成数组。
var merged = new Map([...first, ...second]);

console.log(merged.get(1)); // uno
console.log(merged.get(2)); // dos
console.log(merged.get(3)); // three
```

Map对象也能与数组合并：
```
var merged = new Map([...first, ...second, [1, 'eins']]);
```

### Set
new Set([iterable]);
+ 如果传递一个可迭代对象，它的所有元素将不重复地被添加到新的 Set中。如果不指定此参数或其值为null，则新的 Set为空。
+ Set 对象允许你存储任何类型的唯一值，无论是原始值或者是对象引用。
ES6的这个Set结构出来以后一直被当作一个去重的的一个省时省力的结构，前提是去重的元素不是引用类型的。
![图片](/images/readingNote/set_example.png)

```
let arr =[1,2,4,5,6,1,2];
let set2= new Set(arr);//1,2,3,4,5,6  生成的是Set结构，不是Array结构
```
方法：
```
add(value) 
//在Set对象尾部添加一个元素。返回该Set对象。
clear()
//移除Set对象内的所有元素。
delete(value)
//移除Set的中与这个值相等的元素
entries()
//返回一个新的迭代器对象,[value,value]数组，为了使这个方法和Map对象保持相似， 每个值的键和值相等。
has()
//返回一个布尔值，表示该值在Set中存在与否。
values()
//返回一个新的迭代器对象，该对象包含Set对象中的按插入顺序排列的所有元素的值。
```

### WeakMap
WeakMap 对象是一组键/值对的集合，其中的键是弱引用的。其键必须是对象，而值可以是任意的。
new WeakMap([iterable])
Iterable 是一个数组（二元数组）或者其他可迭代的且其元素是键值对的对象。每个键值对会被加到新的 WeakMap 里。null 会被当做 undefined

WeakMap 的 key 只能是 Object 类型。 原始数据类型 是不能作为 key 的（比如 Symbol）。
WeakMap 的 key是不可枚举的，因为它的弱引用机制，不确保key是否会被GC;没有部署迭代器，不能用for循环遍及
```
delete(key)
get(key)
has(key)
set(key,value)
```
当WeakMap里面的key设置为null时，WeakMap里面将不再存储key=null的映射，取消内存引用避免造成内存泄漏，从而使得不再被使用的key能被正确GC.

### WeakSet
WeakSet 对象允许你将弱保持对象存储在一个集合中。
new WeakSet([iterable]);
如果传入一个可迭代对象作为参数, 则该对象的所有迭代值都会被自动添加进生成的 WeakSet 对象中.
WeakSet 对象是一些对象值的集合, 并且其中的每个对象值都只能出现一次.

它和 Set 对象的区别有两点:

+ WeakSet 对象中只能存放对象引用, 不能存放值, 而 Set 对象都可以.
+ WeakSet 对象中存储的对象值都是被弱引用的, 如果没有其他的变量或属性引用这个对象值, 则这个对象值会被当成垃圾回收掉. 正因为这样, WeakSet 对象是无法被枚举的, 没有办法拿到它包含的所有元素.

方法:
```
clear()
delete(value)
get(value)
has(value)
add(value)
```
example:
```
var ws = new WeakSet();
var obj = {};
var foo = {};

ws.add(window);
ws.add(obj);

ws.has(window); // true
ws.has(foo);    // false, 对象 foo 并没有被添加进 ws 中 

ws.delete(window); // 从集合中删除 window 对象
ws.has(window);    // false, window 对象已经被删除了

ws.clear(); // 清空整个 WeakSet 对象

```
## 小数和整数的那些事
### 取整
```
const num = 2147483648.88;
console.log(num>>>0);// 2147483648 
console.log(Math.trunc(num))//2147483648
//Math.ceil,Math.round,Math.floor均可以取整，从左到右依次是向上取整，四舍五入取整，向下取整
```
### 取小数
```
const num = 2147483648.88;
console.log(num%1)//0.880000114440918
console.log(3.1|0)//3;
console.log(num|0)//-2147483648，'|'由于仅能处理32位整数，所以一旦数字超过这个范围，'|'就不能正确处理
// 由于涉及到浮点数计算，无论加减乘除都会出现精度缺失问题
```
### 浮点数比较
```
//由于精度的问题，浮点数不能用'==='和'!=='来进行比较
let a =0.1,b=0.2,c=0.3;
let sum =a+b;
console.log(sum==c);//false,由于精度问题，所以0.1+0.2是不等于0.3的，应该等于0.30000000000000004
function fract(a,b){
  return Math.abs(a-b)<Number.EPSILON
}
console.log(fract(sum,c));//true,Number.EPSILON 属性表示 1 与Number可表示的大于 1 的最小的浮点数之间的差值。
```

## 位操作符
### << 左移
```
//该操作符会将第一个操作数向左移动指定的位数。向左被移出的位被丢弃，右侧用 0 补充。
9<<2 =36;
9(base 10) =00000000000000000000000000001001 (base 2)
9<<2(base 10) =00000000000000000000000000100100 (base 2)
//在数字 x 上左移 y 比特得到 x * 2y.因此9<<2 = 9*Math.pow(2,2)
```
### >> 右移(有符号)
```
//该操作符会将第一个操作数向右移动指定的位数。向右被移出的位被丢弃，拷贝最左侧的位以填充左侧。由于新的最左侧的位总是和以前相同，符号位没有被改变。所以被称作“符号传播”。
9 (base 10): 00000000000000000000000000001001 (base 2)            
9 >> 2 (base 10): 00000000000000000000000000000010 (base 2) = 2 (base 10)
------
-9 (base 10): 11111111111111111111111111110111 (base 2)
-9 >> 2 (base 10): 11111111111111111111111111111101 (base 2) = -3 (base 10)
```
### >>>右移(无符号)
```
/*
该操作符会将第一个操作数向右移动指定的位数。向右被移出的位被丢弃，左侧用0填充。因为符号位变成了 0，所以结果总是非负的。（译注：即便右移 0 个比特，结果也是非负的。）
*/
9 (base 10): 00000000000000000000000000001001 (base 2)
9 >>> 2 (base 10): 00000000000000000000000000000010 (base 2) = 2 (base 10)
-------
-9 (base 10): 11111111111111111111111111110111 (base 2)
-9 >>> 2 (base 10): 00111111111111111111111111111101 (base 2) = 1073741821 (base 10)
```

### 字符串转整数

+ Number
```
const str = '1';
Number(str)//1
Numebr('')//0
Number('123n')//NaN
```
Number 从字符串第一位开始判断，只要有一个不是数字，返回NaN，如果是空串，返回0；

+ parseInt

```
parseInt('')//NaN
parseInt('123')//123
parseInt('123n')//123
parseInt('n123n')//NaN
```
parseInt 解析 过程中，当非数字字符排在数字后面时，返回解析到的数字，当非数字字符排在数字前面时，返回NaN

+  '>>底层二进制符'
```
'123' >> 0 //123
'123n' >> 0 //0
'n123' >>0 //0 
'' >> 0 //0
```
无效数字返回0，有效数字返回数字
## 总结


<blockquote class="blockquote-center">我会努力更新的</blockquote>