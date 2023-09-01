---
title: dynamic_size_list
date: 2023-09-01 20:40:40
tags: Typescript React React-Virtualized 瀑布流 
---

### 背景描述

实现一个虚拟滚动组件，可以满足列表和瀑布流两种模式

线上预览环境

https://codesandbox.io/s/dong-tai-gao-du-xu-ni-gun-dong-4945px?file=/Masonry.tsx


具体代码实现可以看以上链接

动态高度的计算是在子项渲染之后做的，因此在渲染的时候这里会渲染两次，一次是预渲染，一次是计算过后的渲染

实现高度的组件思路类似，具体可以看代码：
```tsx
import React, { useRef, useEffect } from "react";

const RowRenderer = ({
  index,
  isScrolling,
  key,
  style,
  state,
  render,
  setRowHeight
}) => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const { showScrollingPlaceholder } = state;
  const placeholderContent = (
    <div
      // className={clsx(styles.row, styles.isScrollingPlaceholder)}
      key={key}
      style={style}
    >
      Scrolling...
    </div>
  );

  useEffect(() => {
    if (rowRef) {
      setRowHeight(index, rowRef.current.clientHeight);
    }
    return () => {};
  }, [rowRef, index]);

  return showScrollingPlaceholder && isScrolling ? (
    <div>{placeholderContent}</div>
  ) : (
    <div key={key} className="row" style={style}>
      <div ref={rowRef}>
        <div>{render()}</div>
      </div>
    </div>
  );
};

export default RowRenderer;

```

如果只是需要实现虚拟列表模式，可以考虑用`react-window`来实现，因为这个库更小，这里使用了`react-virtualized`是因为react-window支持的是网格布局，而瀑布流不属于网格布局，所以对于react-window的话不考虑

来看列表的实现：
示例代码，基本可以直接用，有额外需要可以自己做修改
```tsx
import React, { useEffect, useRef, useState } from "react";

import { AutoSizer, List } from "react-virtualized";
import "./list.css";
import RowRenderer from "./Rowrenderer";
interface Props<T extends Record<string, any>> {
  children: (p: { index; isScrolling?: boolean; item: T }) => React.ReactNode;
  data: T[];
  height?: number;
}
export default function VirtualList<T extends Record<string, any>>({
  data,
  height = 400,
  children
}: Props<T>) {
  const listRef = useRef<List>();
  const itemCount = data?.length;
  const [state, setState] = useState({
    listHeight: height,
    listRowHeight: 50,
    overscanRowCount: 10,
    rowCount: itemCount,
    scrollToIndex: undefined,
    showScrollingPlaceholder: false,
    useDynamicRowHeight: false
  });
  const rowHeight = useRef({});

  const setRowHeight = (index: number, value: number) => {
    rowHeight.current = {
      ...rowHeight.current,
      [index]: value
    };

    listRef.current.recomputeRowHeights();
  };
  const _getRowHeight = ({ index }) => {
    return rowHeight.current[index] || state.listRowHeight;
  };
  return (
    <AutoSizer disableHeight>
      {({ width }) => {
        return (
          <List
            ref={listRef}
            className={"List"}
            height={state.listHeight}
            overscanRowCount={state.overscanRowCount}
            // noRowsRenderer={this._noRowsRenderer}
            rowCount={state.rowCount}
            rowHeight={_getRowHeight}
            rowRenderer={({ index, isScrolling, key, style }) => {
              return (
                <RowRenderer
                  index={index}
                  isScrolling={isScrolling}
                  style={style}
                  key={key}
                  setRowHeight={setRowHeight}
                  render={() => {
                    return children({ index, isScrolling, item: data[index] });
                  }}
                  state={state}
                />
              );
            }}
            scrollToIndex={state.scrollToIndex}
            width={width}
          />
        );
      }}
    </AutoSizer>
  );
}

```

这是瀑布流的实现:
```tsx
import React, { useEffect, useRef } from "react";
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  Masonry
} from "react-virtualized";
import { createCellPositioner } from "react-virtualized/dist/es/Masonry";
interface Props {
  itemCount: number;
  children: ({
    index,
    isScrolling
  }: {
    index: number;
    isScrolling: boolean;
  }) => React.ReactNode;
  height?: number;
}
export default function VirtualMasonry({
  itemCount,
  children,
  height = 300
}: Props) {
  const cache = useRef(
    new CellMeasurerCache({
      defaultHeight: 250,
      defaultWidth: 200,
      fixedWidth: true
    })
  );
  const state = useRef({
    columnWidth: 200,
    height,
    gutterSize: 10,
    overscanByPixels: 0,
    windowScrollerEnabled: false
  });
  const width = useRef(0);
  const columnCount = useRef(0);
  const scrollTopRefVal = useRef(0);

  const cellPositioner = useRef(
    createCellPositioner({
      cellMeasurerCache: cache.current,
      columnCount: columnCount.current,
      columnWidth: state.current.columnWidth,
      spacer: state.current.gutterSize
    })
  );
  const masonryRef = useRef();
  const setMasonryRef = (ref) => {
    masonryRef.current = ref;
  };

  const resetCellPositioner = () => {
    const { columnWidth, gutterSize } = state.current;
    if (!cellPositioner) return;
    cellPositioner.current?.reset?.({
      columnCount: columnCount.current,
      columnWidth,
      spacer: gutterSize
    });
  };

  const calculateColumnCount = () => {
    const { columnWidth, gutterSize } = state.current;

    columnCount.current = Math.floor(
      width.current / (columnWidth + gutterSize)
    );
  };
  const onResize = ({ width: w }) => {
    width.current = w;
    // 重新计算列的个数
    calculateColumnCount();
    //  根据列的个数重新计算位置
    resetCellPositioner();
    //  让组件根据位置重新计算
    if (masonryRef) masonryRef?.current?.recomputeCellPositions?.();
  };
  useEffect(() => {
    // 初始化宽度
    calculateColumnCount();
  }, [width]);
  useEffect(() => {
    //  初始化cell position

    cellPositioner.current = createCellPositioner({
      cellMeasurerCache: cache.current,
      columnCount: columnCount.current,
      columnWidth: state.current.columnWidth,
      spacer: state.current.gutterSize
    });
    // console.info("effect:", cellPositioner.current);
  }, [columnCount]);
  // console.info("out:", cellPositioner.current);
  const rowHeight = useRef({});
  const setRowHeight = (index, value) => {
    rowHeight.current = {
      ...rowHeight.current,
      [index]: value
    };
    // onResize({ width: width.current });
  };
  const CellRenderer = ({ index, key, parent, style, isScrolling }) => {
    const { columnWidth } = state.current;

    const divRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      if (divRef) {
        setRowHeight(index, divRef.current.clientHeight);
      }
    }, [divRef]);
    return (
      <CellMeasurer
        cache={cache.current}
        index={index}
        key={key}
        parent={parent}
      >
        <div
          style={{
            ...style,
            width: columnWidth
          }}
        >
          <div
            ref={divRef}
            style={{
              backgroundColor:
                "#" + Math.floor(Math.random() * 16777215).toString(16),
              borderRadius: "0.5rem",
              height: rowHeight.current[index],
              marginBottom: "0.5rem",
              width: "100%",
              fontSize: 20,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {children({ index, isScrolling })}
          </div>
        </div>
      </CellMeasurer>
    );
  };

  const renderMasonry = ({ width: w }) => {
    width.current = w;
    return (
      <Masonry
        autoHeight={false}
        cellCount={itemCount}
        cellMeasurerCache={cache.current}
        cellPositioner={cellPositioner.current}
        cellRenderer={({ index, key, parent, style, isScrolling }) => {
          return (
            <CellRenderer
              index={index}
              key={key}
              parent={parent}
              style={style}
              isScrolling={isScrolling}
            />
          );
        }}
        height={state.current.height}
        overscanByPixels={state.current.overscanByPixels}
        ref={setMasonryRef}
        scrollTop={scrollTopRefVal.current}
        width={w}
      />
    );
  };
  const renderAutoSizer = ({ height, scrollTop }) => {
    scrollTopRefVal.current = scrollTop;
    return (
      <AutoSizer
        disableHeight
        height={height}
        onResize={onResize}
        overscanByPixels={state.current.overscanByPixels}
        scrollTop={scrollTopRefVal.current}
      >
        {renderMasonry}
      </AutoSizer>
    );
  };

  return renderAutoSizer({ height: state.current.height, scrollTop: 0 });
}

```