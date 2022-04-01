---
title: 递归求阶层
date: 2022-01-18 19:50:09
tags:
    - JavaScript
    - 算法
---
问题背景： 递归求两数之间所有数之和

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
ummm 我一开始想法是分别求两个数的阶层，然后相减就是两数之间所有数之和，不过这个应该可以不用相减就可以处理的，如下
```js
function dfs2(n1,n2,current){
    if(n2 >= n1){
        return dfs2(n1,n2 -1,current + n2)
    }else return current
}
function test2(n1,n2){
    return dfs2(n1,n2,0)
}
console.log(test2(1,100))
```
直接在计算阶层的时候处理一下累加的判断条件就行了。