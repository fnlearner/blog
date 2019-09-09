---
title: Traversing
date: 2019-09-06 09:35:15
tags: JavaScript
---

### 深度优先遍历
从某个顶点v出发，首先访问该顶点然后依次从它的各个未被访问的邻接点出发深度优先搜索遍历图，直至图中所有和v有路径相通的顶点都被访问到
<!-- more -->
```
/*递归*/
let deepTraversal1 = (node, nodeList = []) => {
  if (node !== null) {
    nodeList.push(node)
    let children = node.children
    if(children!==null||children.length!==0){
      for (let i = 0; i < children.length; i++) {
        deepTraversal1(children[i], nodeList)
      }
     }
  }
  return nodeList
}
```
```
/*递归*/
let deepTraversal2= (node)=>{
  let nodes=[];
  if(node!== null){
    nodes.push(node);
    let children = node.children;
    if(children!==null||children.length!==0){
      for(let i=0;i<children.length;i++){
        nodes= nodes.concat(deepTraversal2(children[i]));
      }
     }
  }
  return nodes;
}
```

```
/*非递归*/
let deepTraversal2=(node)=>{
  let stack =[];
  let nodes=[];
  if(node){
    /*如果node节点存在*/
    stack.push(node);
    while(stack.length){
      let item= stack.pop();//取出队尾元素
      let children = item.children;//获取元素子节点
      nodes.push(children);//推进子节点，结构与父节点一样
      if(children!==null||children.length!==0){
        for(let i =0;i<children.length;i++){
          stack.push(children[i]);
        }
       }
    }
  }
  return nodes;
}
```
### 广度优先遍历
从某顶点v出发，在访问了v之后依次访问v的各个未曾访问过的邻接点，然后分别从这些邻接点出发依次访问它们的邻接点，并使得“先被访问的顶点的邻接点先于后被访问的顶点的邻接点被访问，直至图中所有已被访问的顶点的邻接点都被访问到
```
let widthTraversal2=(node)=>{
  let nodes=[];
  let stack=[];
  if(node){
    stack.push(node);
    while(stack.length){
      let item = stack.shift();
      let children = item.children;
      nodes.push(node);
      if(children!==null||children.length!==0){
        for(let i =0;i<children.length;i++){
          stack.push(children[i]);
        }
      }
    
    }
  }
  return nodes;
}
```
