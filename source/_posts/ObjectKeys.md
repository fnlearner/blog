---
title: ObjectKeys
date: 2020-07-07 14:59:15
tags: TypeScript
categories: TypeScript
---

### Object.keys
上一个Object.keys()在js中的用法
```bash
const obj = {
    name:'John',
    age:12,
    id:1
}
Object.keys(obj).forEach(key=>{
    //output   'John',12,1
    console.log(obj[key])
})

```
<!-- more -->

试试ts版的
```bash
type Person ={
    name:string,
    id:number,
    age:number
}
declare const me:Person;

Object.keys(me).forEach(key=>{
    // 在ts里面这个时候编辑器会提示我们错误
    console.log(me[key])
})
```
`Element implicitly has an ‘any’ type because expression of type ‘string’ can’t be used to index type ‘Person’. No index signature with a parameter of type ‘string’ was found on type ‘Person’`

来看一下Object.keys的类型声明
```bash
interface ObjectConstructor {
    keys(o: object): string[];
}
```
方法接收任意类型的object作为输入并且返回string类型的数组作为输出。

来回到之前的问题，为什么会报错？

string类型是 我们从Person接口中实际获取到的key的超集，具体的key应该是name|age|id,这些同样是ts允许我们从Person从获取索引的一组值，对于其他的字符串来说,ts认为它们也可以获取索引，但是获取的索引值是any类型的，在严格模式中，any类型是不被允许的，除非有明确的声明.

**注意**：那么这个就很有可能是报错的原因。更具体的类型在已经建立索引的库中引发的问题，或者是因为类型过于复杂导致类型不能正确推导

那么遇到这个问题该怎么解决？

最菜的方法就是把tsconfig.json里面的noImplicitAny选项给关了，那回家用JS吧

### Type-casting(类型转换)

```bash
Object.keys(me).forEach(key=>{
    (me as any)[key]
})
```
这样写法虽然可以，但是不推荐

第二种可以把loop里面的key的类型设置为Person的key，这样就能让ts理解我们在做什么
```bash
Object.keys(me).forEach(key=>{
    me[key as keyof Person]
})
```
这种比之前的要好点，还可以试试其他的，比如让ts自己能够完成这项工作

### Extending Object Constructor(继承接口ObjectConstructor)

在ts里面有一个声明合并的特性

```bash
interface Person {
  name: string;
}

interface Person {
  age: number;
}

interface Person {
  height: number;
}

```
上面的code对Person接口进行了三次的声明，等同于下面这个code
```bash
interface Person{
    name: string;
    age: number;
    height: number;
}
```

所以同理我们可以写ObjectConstructor的接口，写key方法的重载，这次我们需要对object的value值进行细分，并且决定应该返回什么类型

三种行为

1. 如果我们传递进来一个number类型，那么应该返回空数组
2. 如果我们传递进来一个字符串或者一个数组，那么应该返回string[]，也就是字符串数组
3. 如果我们传递进来一个any类型，那么直接返回它的key

看一下怎么构造这个类型
```bash
type ObjectKeys<T> = T extends object?(keyof T)[]:
T extends number?[]:
T extends string|Array<any> ?string[]:
never
```
以never结尾来捕捉异常错误

然后写ObjectConstructor
```bash
interface ObjectConstructor{
    keys(o:T):ObjectKeys<T>
}
```
把这两段代码放在声明文件中，比如lib.d.ts

然后这个时候执行文章开头的那个loop
```bash
Object.keys(me).forEach((key) => {
  //这个时候就可以正常输出了
  console.log(me[key])
})
```
</br>
<div style="overflow:hidden">
    <img src="/images/ObjectKeys/code.png" style="float:left;" 
    title="Codes" alt="picture"/>
</div>





