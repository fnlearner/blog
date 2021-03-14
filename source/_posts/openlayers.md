---
title: openlayers
date: 2021-03-14 18:47:06
tags: gis openlayers ol6
---

### Introduce

近期项目接触到gis到东西，我选择了openlayers6这个开源库来做项目开发，踩来几个坑，记录一下。

### 加载自定义图片作为底图

在加载自定义图片作为底图时，我把url给image对象
```js
const img = new Image()
const url = '/static/img.ppng'
img.url = url
```
在渲染map对象时，我用到是layer下的image，在给定的source这个属性值，我用ImageCanvas来渲染自定义的图层。这是一开始写的代码,但是在这段代码中，会有两个问题：

- 第一个问题是在画布初始渲染的时候会渲染不出来的，必须在缩放层级之后画布才能正常显示；
- 第二个问题就是不管怎么滚动或者平移，画布总会自动聚焦到中心。

```js
 return new ImageCanvas({
      canvasFunction: (
        extent,
        resolution,
        pixelRatio,
        size 
      ) => {
        const canvas = document.createElement('canvas');
        canvas.width = size[0];
        canvas.height = size[1];
        const img = new Image()
        const url = '/static/img.ppng'
        img.url = url
        img.onolad = function(){
            ctx.drawImage(img, 0, 0, size[0], size[1]);
        }
        return canvas;
      },
      projection: 'EPSG:3857'
    });
```
首先第一个问题解决方案，那就是在img到onload里面来进行一个底图渲染的工作。
第二个问题的原因是因为openlayers 中不管对地图平移还是缩放，都会进行重绘的操作，所以解决方案就是设置一个临时变量来判断是否是第一次绘制。

like this 
```js
return new ImageCanvas({
      canvasFunction: (
        extent,
        resolution,
        pixelRatio,
        size /*, projection*/
      ) => {
        const canvas = document.createElement('canvas');
        canvas.width = size[0];
        canvas.height = size[1];

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const ctx = canvas.getContext('2d')!;
        // 这里必须要做一个判断，每次的范围变动都会引起重绘，从而触发该回调函数
        if (this.isFirst) {
          this.isFirst = false;
          ctx.beginPath();
          ctx.drawImage(img, 0, 0, size[0], size[1]);
          ctx.closePath();

          return canvas;
        }
      },
      projection: 'EPSG:3857'
    });
```

### 底图限制拖动范围

在view中定义extent即可

### 在移动feature时限制在容器之内

- 首先要限制范围，首选需要获取到容器到边界。获取view的extent即可
- 其次需要在移动过程中获取多边形的边界。调用getExtent即可
- 然后需要做临界值判断，根据boolean值来判断是否允许移动，容器边界跟feature边界比较即可。
- 最后怎么来移动，参考库中自带的Translate可以发现，是获取到feature到geometry到translate方法来移动，当判断临界值时，移动的距离设置为0即可。

为了应对不同分辨率或者容器大小下的限制范围 --- 由于extent不会自动针对分辨率或者容器大小来计算，所以需要使用calculateExtent来根据容器大小获取最新的extent

以上 需要重写部分Translate的实现

### 在编辑feature时同样需要限制范围。

原理同移动feature，但是略复杂

### undo redo的实现

因为需求中仅要记录移动feature和编辑feature，因此在undo redo的时候就是在addFeature和removeFeature中来回切换，只要记录当前操作的undo操作和redo操作即 --- 在项目中undo 和redo的过程其实就是清除绘画和重新绘画的过程，我大概试了上百次，performance表现良好，一片绿色，但是记得在新增新的modify或者translate的时候要把上次的清除，不然有性能问题，非常卡。

### 点击feature实行交互，点击空白取消交互，点击其他feature，当前交互，上次取消交互。

之前是自己直接用click事件来做处理，后来发现selet这个可以帮我处理点击和取消点击的样式问题，但是仍然需要我自己处理交互问题，每次点击feature的时候其实就是把上次的modify和translate删除，然后重新添加一份当前点击feature的modify和translate，
