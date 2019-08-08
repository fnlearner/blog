---
title: leetcode第55之跳跃游戏
date: 2019-08-08 17:01:05
tags: leetcode
categories: leetcode
---

### leetcode第55之跳跃游戏
```
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