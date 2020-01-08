---
title: mutationObserver
date: 2019-12-18 12:21:22
tags: mutation
---

### MutationObserver,一个监听dom元素变化的接口

dom元素观察者，监视 DOM 变动的接口，但是事件是异步的，需要等所有dom元素渲染完之后才执行
实例化一个observer对象,回调函数接收两个参数，一个是改变的属性所组成的一个对象数组，一个是实例本身
<!--more -->
```
const observer = new MutationObserver(mutationCallback);
```
以下是它的属性介绍
|  属性   | 类型  | 描述  |
|  ----  | ----  | ---- |
| childList  | Boolean |是否观察子节点的变动
| attributes  | Boolean |是否观察属性的变动
| characterData  | Boolean |是否节点内容或节点文本的变动
| subtree  | Boolean |是否观察所有后代节点的变动
| attributeOldValue  | Boolean |观察 attributes 变动时，是否记录变动前的属性值
| characterDataOldValue  | Boolean |观察 characterData 变动时，是否记录变动前的属性值
| attributeFilter  | Boolean |表示需要观察的特定属性（比如['class','src']），不在此数组中的属性变化时将被忽略

实例初始化后,实例调用observe来监听targetNode属性的变化，需要监听的属性放在config中
```
const config = {
    attributes:true,
    childList:true,
    subtree:true
}
const targetNode = document.getElementById('test');
observer.observe(targetNode,config)
```
回调函数中可以这样写
```
const mutationCallback = (mutationList)=>{
  for(let mutation of mutationList){
    const type = mutation.type;
    switch(type){
      case 'childList':
        console.log('A child node has added or removed');
        break;
      case 'attributes':
        console.log(`the ${mutation.attributaName} attribute was modified`);
        break;
      case 'subtree':
        console.log('the subtree was modified';)
        break
    }
  }
}
```
基本这样就可以完成了一个对dom元素的监听了

当不想监听dom元素变化的时候,可以用disconnect来取消监听
```
observer.disconnnet()
```