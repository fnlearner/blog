---
title: 理解 flex-basis
date: 2020-11-14 21:52:55
tags:
    - css
---
上个html代码
```html
<div class="parent">
  <div class="child">Child</div>
  <div class="child">Child</div>
  <div class="child">Child</div>
</div>
```
css≠
```css
.parent {
  display: flex;
}
.child {
  flex: 0 1 auto; /* Default flex value */
}
```
<html>
<style>
body{
    body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}
}
.parent {
  display: flex;
}
.child {
  flex: 0 1 auto; /* Default flex value */
  /* 上面的代码相当于是
  *flex-grow:0; flex-shrink:1;flex-basis:auto;s
  *
  */
}
.child-grow{
    flex:1 0 auto;
}
.child-flex{
    flex:1 1 auto
}
</style>
<div class="parent">
  <div class="child">Child</div>
  <div class="child">Child</div>
  <div class="child">Child</div>
</div>
</html>

```css
.child {
  flex: [flex-grow] [flex-shrink] [flex-basis];
}
```
<span id="showCssText"><span>



<button id="toggle">toggle</button>
<script>
const btn = document.getElementById("toggle");
btn.addEventListener('click',function(){
        const span = document.getElementById('showCssText');
        [...document.getElementsByClassName('child')].forEach(item=>{
            const classList = item.classList;
            // console.log(classList)
            if(classList.length === 1 ){
                classList.add('child-grow')
                span.innerText = 'flex:1 0 auto;'
            }else if(classList.length === 2){
                classList.add('child-flex')
                span.innerText = 'flex:1 1 auto'
            }else{
                classList.remove('child-flex')
                classList.remove('child-grow')
                span.innerText = 'flex: 0 1 auto; '
            }
        })
})
</script>


flex-basic 默认是auto，告诉元素保持一个理想的尺寸；但是默认情况下的元素宽度是多少？auto告诉元素它的宽度由它的内容决定。为了让子元素占据父元素的所有空间，可以给子元素的宽度设置为`width:100%`,或者`flex-basis:100%`,或者`flex-grow:1`。假如有个宽为700px的容器，里面两个子元素分别设置了`flex-basic:200px`和`flex-basic:300px`，那么占据空间的计算会以700 - 200 - 300 之后再进行分配空间。

当给flex 的第三值 ，也就是 flex-basis 设置成1000px时，它会试着占据1000px的空间，如果不行，它会等比例占据其他元素的空间，但是其他元素内的文本长度同样会影响这个元素的位置分配；但是在更小的屏幕上可能会发现实际宽度并没有1000px，这是因为给了shrink，这个值告诉元素需要它等值缩小
```bash
.child-three {
  flex: 0 1 1000px;
}
```

如果grow 和 shrink都是0，那么元素不会等比例压缩，basis如果超出父元素宽度，那直接超出
```bash
.child-three {
  flex: 0 0 1000px;
}
```