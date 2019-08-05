---
title: JavaScript读书笔记
date: 2019-8-5 10:36:13
tags:
---

## 一、new运算符的实现

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

## 二、call和bind实现

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

### 迭代器iterator

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

## 四、扁平化

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


### 五 var  let const 

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

## 六 事件循环

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


### 总结

如有问题欢迎指正~ 需要各位大佬指点，好困了，晚安
