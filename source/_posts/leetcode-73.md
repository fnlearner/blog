---
title: leetcode第73之矩阵置0
date: 2019-08-08 17:13:41
tags: leetcode
categories: leetcode
---

描述：: 给定一个 m x n 的矩阵，如果一个元素为 0，则将其所在行和列的所有元素都设为 0。请使用原地算法。
<!-- more -->

```bash
/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
var setZeroes = function(matrix) {
    let columns=new Set(),rows=new Set();
    for(let row =0;row<matrix.length;row++){
        for(let column =0;column<matrix[row].length;column++){
            if(matrix[row][column]==0){
                columns.add(column);
                rows.add(row);
            }
        }
    }
    for(let row =0;row<matrix.length;row++){
        for(let column =0;column<matrix[row].length;column++){
           if(rows.has(row)||columns.has(column)){
               matrix[row][column]=0;
           }
        }
    }
    return matrix;
};

```
题解：将0所在的行列储存起来作为标记，第二次循环的时候判断元素当前所在行或者列是否在标记的行或列即可