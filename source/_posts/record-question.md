---
title: 记录开发过程中遇到的问题
date: 2019-11-13 10:18:01
tags: JavaScript
---

#### 正则表达式相同输入输出不同结果

```
const str ='1';
const reg = /1/g;
reg.test(str);//true
reg.test(str);/false
//第一次执行的时候返回true，第二次返回的是false
```
<!--more -->
这个问题困扰了我很久，后来查阅了MDN和百度，发现正则表达式如果设置了全局标志g，那么test的执行会更新lastIndex，连续的执行test()方法，后续的执行不会从首位开始，而是会从lastIndex开始，因此第一次执行的时候从首位开始，匹配成功，返回true，这时候lastIndex的值更新成第一次执行匹配时找到的index，第二次执行的时候从lastIndex开始，但是没有匹配结果，所以返回false。

#### layui框架下reload表格时，当表格有滚动条时，表格闪烁

由于每列都应用了templet，因此没有调用框架自带的单元格编辑功能，因此table在渲染时会对td绑定自定义事件，而table.reload()执行的时候其实就是执行table.render()方法，而render方法每次调用时总是会重新渲染dom元素以及数据，因此当表格有滚动条的时候，执行reload的时候表格会闪烁，这时的用户体验非常不好。本质reload是调用render，render其实就是渲染dom元素加更新数据的结合，因此我分别手动渲染dom元素以及更新layui的表格的缓存数据，这样子就不会执行reload方法，templet的dom结构类似这样，list-text类用来显示文本，out-box里面的dom结构可能为输入框，或者下拉框。每次更新数据的时候都需要渲染dom，代码会冗余，因此我写了Proxy，当更新数据的时候，执行Proxy中渲染dom的方法
```
<div class="list-text>
  <div class="list-span"></div>
</div>
<div class="out-box>
  <input></input>
</div>
```

#### 复制文本内容

```
document.execCommand('copy')//原生复制方法
```
想要用document.execCommand来复制文本内容，但是此方法仅能复制可编辑区域中的内容，因此采用曲线救国的方式，即将想要复制的内容赋值给某可编辑元素的value值，并且将焦点集中在此可编辑元素并且全选，这样执行document.execCommand('copy')即可将想要的内容复制到剪贴板
```
<div class="text">
  hello world
</div>
<button type="button" id="copy">复制</button>
//index.js
const handler = ()=>{
  const input = document.createElement('input');
  $(input).attr("readonly","readonly");
  $(input).attr("value",$(".text").text().toString());
  document.body.appendChild(input);
  if(document.execCommand('copy')){
    $(input).focus().select();//这里一定要写，input获取焦点并且全选
    document.execCommand('copy');
    console.log('success!');
  }
  document.body.removeChild(input);
}
$('#copy').on('click',handler);
```

### 短路检测

```
const value = number || '';
// number -> 0  value => ''
```
当number转为bool时的值为true时，value= number，当number转为bool时的值为false时，value= number; 这句代码的目的其实是当number为有值时显示值，异常值如undefined,NaN,null的时候显示空，但是好巧不巧，当number 为0的情况下时，转为bool值时值是false，这样value会被置空，
```
const value = Number.isNaN(parseInt(number))?number:'';
```
![图片](/images/record_question/screen1.png)
undefined,null,NaN在parseInt的转化下都成了NaN，这里不考虑Object


### 模板复用

因为公司用layui做开发，然后表格渲染的时候总会需要用到templet的情况，然后其实很多模板格式都是一样的，但是由于属性名字的不一致，就导致需要写很多款式一模一样的templet，就很崩溃, 然后今天搞了个复用的写法.
```
const showTemplet(name){
  //name是传递进来的具体的值
  return function(data){
    //data是table组件模板传递的table需要渲染的每一行数据
    return  `<span>${data[name]}</span>`
  }
}
//table render
const item = [
  {
    field:'idx',
    width:80
  }
]
item.map(_item=>{
    return {
      field:_item.field,
      title:'',
      width:item.width,
      templet:showTemplet.call(null,item.field)
    }
})
```