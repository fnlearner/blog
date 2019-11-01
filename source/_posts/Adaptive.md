---
title: 自适应布局
date: 2019-08-07 16:41:14
tags: 
  - css 
  - JavaScript
categories: JavaScript
---

## grid

css
```
.main{
        display: grid;
        grid-template-columns:repeat(auto-fill,27rem);
        grid-gap:3rem 1.5rem;
}       
.main > .item{
        background-color: blue;
        width:100%;
        height: 100px;
}
```
html
<!-- more -->
```
<div class="main">
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
</div>
```
以上代码效果能让每一行都尽量铺满
<html>
    <head>
        <style>
            .main{
                display: grid;
                grid-template-columns:repeat(auto-fill,27rem);
                grid-gap:3rem 1.5rem;
            }
            .main > .item{
                  background:linear-gradient(45deg,black,transparent);
                width:100%;
                height: 100px;
            }
        </style>
    </head>
    <body>
            <div class="main">
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
                <div class="item"></div>
            </div>
    </body>
</html>

## table

css
```
.container{
    display: table;
    width: 100%;
    border-spacing: 30px 0;
}
.container >div{
    display: table-cell;
    background-color: #00ffff;
    border: 1px solid black;
    height: 200px;
    width: 25vw;
}
```
html
```
    <div class="container">
        <div class="item">item</div>
        <div class="item">item</div>
        <div class="item">item</div>
        <div class="item">item</div>
    </div>
```
<html>
    <head>
        <style>
            .container{
                display: table;
                width: 100%;
                border-spacing: 30px 0;
            }
            .container >.item{
                display: table-cell;
                background-color: #00ffff;
                border: 1px solid black;
                height: 200px;
                width: 25vw;
            }
        </style>
    </head>
    <body>
     <div class="container">
        <div class="item">item</div>
        <div class="item">item</div>
        <div class="item">item</div>
        <div class="item">item</div>
    </div>
    </body>
</html>

## flex

css
```
.main{
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;             
}
.main > .item{
    width: 300px;
    background:linear-gradient(45deg,black,transparent);
    height: 100px;
}

```
html

```
<div class="main">
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
</div>
```
<html>
    <head>
        <style>
            .main{
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-start;
            }
            .main > .item{
                width: 300px;
                background:linear-gradient(45deg,black,transparent);
                height: 100px;
            }
        </style>
    </head>
    <body>
        <div class="main">
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
        </div>
    </body>
</html>

以下[原文](https://juejin.im/post/5b90e07ce51d450e6a2dd140)

## 媒体查询

```
@media screen and (min-width:240px) {
    html, body, button, input, select, textarea {
        font-size:9px;
    }
}
@media screen and (min-width:320px) {
	html, body, button, input, select, textarea {
		font-size:12px;
	}
}
// 红米Note2
@media screen and (min-width:360px) {
	html, body, button, input, select, textarea {
		font-size:13.5px;
	}
}
@media screen and (min-width:375px) {
	html, body, button, input, select, textarea {
		font-size:14.0625px;
	}
}

```

## JS设置html的font-size大小

```
document.documentElement.style.fontSize = document.documentElement.clientWidth / 750 + 'px';
```

## vw

```
//使用vw设置，vw也是一个相对单位，100vw等于屏幕宽度
html{
    font-size: 10vw;
}
```



