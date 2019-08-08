---
title: leetcode第70之爬楼梯
date: 2019-08-08 17:03:42
tags: leetcode
categories: leetcode
---

描述：假设你正在爬楼梯。需要 n 阶你才能到达楼顶。

每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？

注意：给定 n 是一个正整数。
两种写法，一种递归，一种开循环。
写递归有一个问题，当数据量庞大的时候，递归会爆栈，开循环就不存在爆栈的问题，因为循环只是在一个调用栈执行的，并且不会像递归一样重复计算值。
<!-- more -->
```
/**
 * 爬楼梯
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    let ans =[1,2];
    if(n==1||n==2){
        return ans[n-1];
    }
    for(let i = 2;i<n;i++){
        ans[i]=ans[i-1]+ans[i-2];
    }
    return ans[n-1]

    // else {
    //     return climbStairs(n-1)+climbStairs(n-2);
    // }
};
console.log("climbStairs(44):", climbStairs(44));
// climbStairs(3)
```
