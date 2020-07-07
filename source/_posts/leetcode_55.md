---
title: leetcode第55之跳跃游戏
date: 2019-08-08 17:01:05
tags: leetcode
categories: leetcode
---

 描述:给定一个非负整数数组，你最初位于数组的第一个位置。

数组中的每个元素代表你在该位置可以跳跃的最大长度。

判断你是否能够到达最后一个位置
<!-- more -->
```bash
/**
 * @param {number[]} nums
 * @return {boolean}
 */
 
var canJump = function(nums) {
    const length = nums.length;
    let lastIndex = nums.length-1;
    const res = [];
    for(let i=lastIndex;i>=0;--i){
            if(nums[i]+i>=lastIndex){
             
                lastIndex = i;
            }
    }
    return lastIndex == 0 ;
};
```