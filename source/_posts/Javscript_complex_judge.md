---
title: Javscript复杂判断
date: 2019-08-07 15:13:17
tags: JavaScript
categories: JavaScript
---

在公司维护前人代码的时候，经常会遇见一堆的if-else语句
### if-else

```js
const flag = (status)=>{
    if(status ==0){
        //do somethind
    }else if(status==1){
        //do somethind
    }else if(status ==2){
        //do something
    }else if(status ==3){
        //do something
    }
    //...
}
```
<!--more -->
或许还可以用switch-case的写法
### switch-case

```js
const flag = (status)=>{
    swtich(status){
        case 0:
            //do something
            break;
        case 1:
        case 2:
            //do something
            break;
        case 3:
            //do something
            break;
        default:
            return ;
    }
}
```
假如case 1和 case 2的处理情况都一样，可以像上面的写法.

然鹅如果需要判断的条件多的时候，如果继续用if-else的写法，那么工作量会翻倍

```js
const flag = (status,type)=>{
    if(type==0){
        if(status ==0){
            //do somethind
        }else if(status==1){
            //do somethind
        }else if(status ==2){
            //do something
        }else if(status ==3){
            //do something
        }
    }else if(type==1){
         if(status ==0){
            //do somethind
        }else if(status==1){
            //do somethind
        }else if(status ==2){
            //do something
        }else if(status ==3){
            //do something
        }
    }
}
```
这种写法太麻瓜了吧，简直反人类

### Map
```js
const actions = ()=>{
    function A(){
        return 'A'
    }
    function B(){
        return 'B'
    }
    return new Map([
        ['0_0',A],
        ['0_1',A],
        ['0_2',B]
    ])
}
const flag =(status ,type)=>{
    const action = actions().get(`${type}_${status}`);
    console.log(action());
}
flag(0,0);//A
```
直接将逻辑封装起来，然后在另一个函数调用，看起来就干净很多！！！


```js
const actions = ()=>{
    function A(){
        return 'A'
    }
    function B(){
        return 'B'
    }
    return new Map([
        [/^0_[0-3]/,A],
        [/1_[0-2]/,A],
        [/1_1/,B]
    ])
}
const flag =(status ,type)=>{
     const action = [...actions()].filter(([key,value])=>{
        return key.test(`${type}_${status}`)
    })
    action.forEach(([_,value])=>{
        console.log("value.apply(this):", value.apply(this));//A
        value.call(this);
    })
}
flag(1,1);
```