---
title: 优雅的书写方式
date: 2019-10-27 17:31:42
tags:
---

### 变量声明

```
//变量声明用let or const
let a = 1;
const b = 2;
```

### 对象属性赋值

```
const getKey(key){
  return `a key named ${key}`
}
//使用动态属性作为键名，用计算后的属性
const obj={
  id:1,
  name:'John',
  [getKey('enable')]:'Tom'
}
```

### 键名与键值的变量名相同，不需要写两遍

```
const name = 'John';
const obj = {
  name
}
```

### 对象数据分组排序

```
//解构赋值的排前面
const name = 'John',age=2, grade = 80;
const obj = {
  name,
  age,
  level:grade
}
```
### 属性声明

```
//键名声明不需要写引号,仅有无效标识符需要加引号
const obj = {
  a:1,
  'data-self:true
}
```

### 不要直接调用Object.prototype的方法，比如hasOwnProperty

```
const obj = {
  a:1
}
//不要直接用ojb.hasOwnProperty(Do not use obj.hasOwnProperty directly)

Object.prototype.hasOwnProperty.call(obj,key)//use Object.prototype.call instead
//or
const has = Object.prototype.hasOwnProperty;
has.call(obj,key)//
```

### use the object spread operator instead of Object.assign to shallow-copy objects

```
const obj = {
  name:'Tom'
}
const cloneObj ={...obj,age:1}//cloneObj -> {name:'Tom',age:1}
```

### use spread operator to copy Array

```
const arr = [1,2,3,4];
const cloneArr = [...arr];//cloneArr - .[1,2,3,4]
```

### use Array.from() or spread operator to convert an iterable Object

```
const foo = document.querySelectorAll('.foo');//it is a nodelist

const arrNode = Array.from(foo);

//or

const arrNode1 = [...foo];

```

### use Array.from() instead of spread operator  for mapping over iterables ,because it won't creat an intermediate array

```
const foo =[1,2,3];
const bar = Array.from(foo,function(item){
  return Math.pow(item,2)
})
```

### use object destructuring when accessing and using multiple properties of an object. 

```
//No
const render = param => {
  const firstName = param.firstName;
  const secondName = param.secondName;
}
//Yes,and maybe we should give them default value,or if firstName or secondName dont exist in param , they will be undefined
const render = param =>{
  const {
    firstName='' ,secondName=''
  } = param;
}
```


### use array destructuring instead of arr[0].

```
const render = param =>{
  const [firstName,secondName] = param;
}
```

### use object destructuring if u dont need certaine property

```
// if u dont need secondName,u can use object destructuring,and what u need exists in rest
const render = param =>{
  const {
    secondName,...rest
  } =param//rest-> {firstName,age}
}
render({
  firstName,
  secondName,
  age
})
```

### use `` instead of '' or ""

```
const name = 'John';
//No
const wholeName = 'My name is'+ name;
//Yes
const wholeName = `my name is ${name}`
```

### dont declare function in a block like if,while ,etc

```
//No
if(true){
  function test(){
    console.log('bad')
  }
}
//Yes
let test ;
if(true){
  test = () =>{
    console.log('good')
  }
}
```

### use spread operator(...) instead of arguments,because arguments is a Array-like Array and not a real Array

```
//No
const render = arguments => {
  const arr = Array.prototype.slice.call(arguments);
}
//Yes
const render =(...args) => {
  const arr = args;
}

```

### use void 0 instead of undefined

```
let undefined = 1;
var a;
console.log(a === undefined)// false
console.log(a === void 0)//false
```

### in a module with single export use default export instead of name export

```
export default function es6(){}
```
