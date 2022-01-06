---
title: dh算法
date: 2022-01-04 21:01:41
tags: dh
---
全称 Diffie Hellman密钥交换算法

DH算法属于公钥加密算法，https加密过程客户端C与服务端需要用到dh算法或者RSA算法来协商用户加密数据的session key

在加密数据时使用对称密码算法，密钥管理使用公钥密码技术
<!-- more -->
### 背景介绍 -- 离散对数

假设a, p均为素数，则有以下等式：
{a<sup>1</sup>mod p, a<sup>2</sup>mod p,…, a<sup>(p-1)</sup>mod p} ={1, 2, …, p-1} //{}表示集合 ，假定为T

对于任意⼀个数x,若0<x<p,则必定存在唯⼀的y (0<y<p),使得x = a<sup>y</sup>mod p，当p很⼤时，很难求出y。

有以下公式：

((a<sup>x</sup>mod p)<sup>y</sup>)mod p = a<sup>xy</sup>mod p

example:
```bash
a = 3,p = 7

3mod7 = 3
9mod7 = 2
27mod7 = 6 

此时集合T为{2,3,6}
```

dh算法的安全性则是基于这个问题的难解性。

### DH算法基本原理

![原理](/images/dh算法/原理.png)

此时两个计算的共享密钥是相等的，中间人通过窃听双方在通信过程中的信息是可以获取到Ya，Yb，a，q这四个值的，而中间人若想知道双方计算出来的K的话，就需要知道某一方的指数，即Xb或者Xa，假设说中间人要获取Xb的值，那么Xb就等于${log_a{Yb}}$,而计算离散对数的结果是非常困难的，而对于大素数来说，求解离散对数被认为是不可能的，因此当q取极大值时，计算Xb是不可能的。


example:

a = 3 q = 17

当Xa = 15 时

Ya = 3<sup>15</sup> mod 17 = 6

6 -- > 发送给了Blob

当Xb = 13 时

Yb = 3<sup>13</sup> mode 17 = 12

12 --> 发送给Alice

Alice的共享密钥为 12<sup>15</sup> mode 17 = 10

Blob的共享密钥为 6<sup>13</sup> mode 17 = 10

以上即为DH加密算法

摘自[blibli](https://www.bilibili.com/video/BV12w411f7c5?from=search&seid=7708955631160057078&spm_id_from=333.337.0.0)