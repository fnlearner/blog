---
title: 递归求阶层
date: 2022-01-18 19:50:09
tags:
    - JavaScript
    - 算法
---

```js
function dfs(n,current){  
    if(n > 0){
        // current 是累加数，只要没有到最后一个就继续累加
       return dfs(n-1,current + n)
    }else return current
}
function test(n1,n2){
    if(n1 > n2) return 0;
    // 两数到阶层相减就是两数之间所有数之和
    const result = dfs(n2,0) - dfs(n1 - 1,0)
    return result
}
console.log(test(1,100))
```
