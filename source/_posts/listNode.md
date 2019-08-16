---
title: 链表
date: 2019-08-13 14:26:56
tags: Javascript listNode
categories: Javscript
---

链表相比数组而言，链表对数据的插入数据的空间复杂度为o(1)
```
/**
*链表节点
*param {*} val
*param {ListNode} next
**/
function ListNode(val,next=null){
    this.val = val;
    this.next = next;
}
```
<!-- more -->
```
/**
*将数组转为链表
*param {array} a
*param {ListNode} 
**/
const getListFromArray=a=>{
    let dummy = new ListNode()
    let pre =dummy;
    a.forEach(x => {
        return pre=pre.next=new ListNode(x);
    });
    return dummy.next;
}
```

### 顺序遍历链表
```
let listNodeArr = getListFromArray(arr);
while(listNodeArr!=null){
    console.log(listNodeArr.val);
    listNodeArr=listNodeArr.next;
}
//1 2 3 4 5 6
```
### 删除链表的倒数第N个节点

第一个指针从列表的开头向前移动 n+1n+1 步，而第二个指针将从列表的开头出发。现在，这两个指针被 nn 个结点分开。我们通过同时移动两个指针向前来保持这个恒定的间隔，直到第一个指针到达最后一个结点。此时第二个指针将指向从最后一个结点数起的第 nn 个结点。我们重新链接第二个指针所引用的结点的 next 指针指向该结点的下下个结点。
```
var removeNthFromEnd = function(head, n) {
    let dummy=new ListNode(0);
    dummy.next=head;
    let slow=dummy;
    let fast=dummy;
    for(let i =1;i<=n+1;i++){
        slow=slow.next;
    }
    if(!slow)return head.next;
    while(slow!=null){
        slow=slow.next;
        fast=fast.next;
    }
    fast.next=fast.next.next;
    return dummy.next;
}
 removeNthFromEnd(listNodeArr,4);
```
### 环形链表

给定一个链表，判断链表中是否有环。

为了表示给定链表中的环，我们使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。 如果 pos 是 -1，则在该链表中没有环。


```
var hasCycle = function(head) {
    let slow = head, fast = head
    while (fast && fast.next) {
        slow = slow.next
        fast = fast.next.next
        if (slow === fast) { return true }
    }
    return false
};

```
给定一个链表，返回链表开始入环的第一个节点。 如果链表无环，则返回 null。

为了表示给定链表中的环，我们使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。 如果 pos 是 -1，则在该链表中没有环。

说明：不允许修改给定的链表。
```
var detectCycle = function(head) {
    if(!head || !head.next) return null;
    
    let slow = head;
    let fast = head;
    while (true) {
        if(!fast || !fast.next) return null;
        slow = slow.next;
        fast =fast.next.next;
        if(slow === fast) break;
    }
    
    slow = head;
    while (slow !== fast) {
        slow = slow.next;
        fast = fast.next;
    }
    
    return slow;
};
```
![图片](https://pic.leetcode-cn.com/99987d4e679fdfbcfd206a4429d9b076b46ad09bd2670f886703fb35ef130635-image.png)

我们利用已知的条件：慢指针移动 1 步，快指针移动 2 步，来说明它们相遇在环的入口处。（下面证明中的 tortoise 表示慢指针，hare 表示快指针）
2⋅distance(tortoise)=distance(hare)
2(F+a)=F+a+b+a
2F+2a=F+2a+b
F=b
​因为 F=b，指针从 hh 点出发和从链表的头出发，最后会遍历相同数目的节点后在环的入口处相遇。

 ### 相交链表
```
/**
 * @param {ListNode} headA
 * @param {ListNode} headB
 * @return {ListNode}
 * 时间复杂度O(n)，空间复杂度O(1)
 * 思路：想法特别精妙，两个链表长度不一致，短+长拼接和长+短拼接，最后节点相等时不是相交节点就是（null===null）
 * 举栗子：[0,9,1,2,4]和[3,2,4] 两个链表拼接后[0,9,1,2,4,3,2,4]和[3,2,4,0,9,1,2,4]相交节点在2开始相同
 */
var getIntersectionNode = function(headA, headB) {
  if (headA === null || headB === null) return null;
  let curA = headA;
  let curB = headB;
  // curA===curB说明相交或者全部节点走完直接返回
  while (curA !== curB) {
    //A节点走完走B 实现A+B
    curA = curA === null ? headB : curA.next;
    curB = curB === null ? headA : curB.next;
  }
  return curA;
};
```
<html>
  <head>
    <style>
      .css-82kbtk-Text {
        font-family: monospace;
        white-space: pre;
        user-select: none;
        font-size: 12px;
        line-height: 14px;
        color: rgb(38, 50, 56);
        max-height: 100px;
        margin: 0px 20px;
        overflow: auto;
    }
    </style>
  </head>
  <body>
    <div class="css-82kbtk-Text"> 
     _   _      _ _    __        __         _     _ 
    | | | | ___| | | __\ \      / /__  _ __| | __| |
    | |_| |/ _ \ | |/ _ \ \ /\ / / _ \| '__| |/ _` |
    |  _  |  __/ | | (_) \ V  V / (_) | |  | | (_| |
    |_| |_|\___|_|_|\___/ \_/\_/ \___/|_|  |_|\__,_|
    </div>
  </body>
</html>
