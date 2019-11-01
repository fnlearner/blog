---
title: 思考如何使a==1&&a==2&&a==3为true
date: 2019-11-01 15:58:18
tags:
  - JavaScript
---

涉及运算符比较过程，运算符在比较两个值是否相等的时候做了什么,第二个涉及闭包JS比较两个数值是否相等可以用== 和=== ，<!--more -->其中 == 会有隐式类型转换的操作，===则不会,在两个数比较时，先调用valueOf,如果返回的不是原始类型，继续调用toString,如果不是原始类型，抛出异常

```
const b = {
  value :1,
  toString(){
    return {
      name:1
    }
  },
  valueOf(){
    return {
      name:1
    }
  }
}
console.log(`toString : ${b==3}`)
console.log(`valueOf : ${b==4}`)
//抛出异常TypeError: Cannot convert object to primitive value
```

```
const b = {
  value :1,
  toString(){
    return 3
  },
  valueOf(){
    return {
      name:1
    }
  }
}
console.log(`toString : ${b==3}`)
console.log(`valueOf : ${b==4}`)
//toString:true,valueOf:false
```
```
const b = {
  value :1,
  toString(){
    return 3
  },
  valueOf(){
    return 4
  }
}

console.log(`toString : ${b==3}`)//false
console.log(`valueOf : ${b==4}`)//true

```

OK,接下来说正题， a==1的时候先调用了a.valueOf(),然后根据valueOf的返回值与1进行比较,但是在a==1为真的情况下如何确保a==2以及a==3也同时成立呢？还记得里两个数比较时做的操作吗？先调用valueOf,然后是toString,所以只要覆写其中一个方法
```
const a ={
  value:1,
  toString(){
    return this.value++;
  }
}
//由于这时的a是一个Object,所以调用valueOf的时候返回的并不是原始类型，因此我们覆写toString方法即可
console.log(a==1&&a==2&&a==3)//true
```