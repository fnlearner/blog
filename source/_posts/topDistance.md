---
title: topDistance
date: 2022-05-24 20:52:20
tags: 
    - react
    - height 
---

计算某个DOM元素距离浏览器顶部的距离

```js
import * as React from 'react';

export default function useTopDistance<T extends HTMLDivElement>(defaultInstance = 24) {
  const divRef = React.useRef<T>(null);
  const [height, setHeight] = React.useState(0);
  // 递归获取遍历到的元素的offsetTop
  const getElementInstanceToTop = (el: HTMLElement | null): number => {
    if (el?.offsetParent) {
      return getElementInstanceToTop(el?.offsetParent as HTMLElement) + el.offsetTop + el.scrollTop;
    }
    return el ? el.offsetTop : 0;
  };
  // 重新计算高度，因为可能需要在填充数据的时候设置高度
  const calculateHeight = React.useCallback(() => {
    const { clientHeight } = document.body;
    const offsetParentTop = getElementInstanceToTop(divRef.current);
    const result = clientHeight - offsetParentTop ?? 0;
    setHeight(result - defaultInstance);
  }, []);

  React.useLayoutEffect(() => {
    window.requestAnimationFrame(calculateHeight);
    window.addEventListener('resize', calculateHeight);
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);

  return {
    divRef,
    height,
    calculateHeight,
    // rafCalculateHeight: window.requestAnimationFrame(calculateHeight),
  };
}

```
