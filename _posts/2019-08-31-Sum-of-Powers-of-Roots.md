---
layout:		post
title:		Sum of Powers of Roots
date:		2019-08-31
author:		wyj
catalog:	true
tags:
    - OI
    - 数学
---

好久没有写过数学方面的博客了。

方程(1)
$$P(x)=\sum_{k=0}^{n}a_kx^k=0,a_n=1$$
对应递推式
$$\sum_{k=0}^{n}a_kF_{k}=0$$
即
$$F_n=-\sum_{k=0}^{n-1}a_kF{_{k}}$$
令(1)的解为$$x_1,x_2\ldots x_n$$。

定义$$S_m:=\sum_{k=1}^{n}x_k^m$$，$$m\le n$$。显然当$$m\gt n$$时$$S$$符合$$F$$的递推式。

将$$S_m$$带入$$F$$的递推式中，不能完美符合。观察误差项的规律，得到
$$S_m=a_{n-m}(n-m)-\sum_{k=n-m}^{n-1}a_kS_{k-n+m}$$
$$=a_{n-m}(n-m)-\sum_{k=1}^{m}a_{n-k}S_{m-k}$$
(这里坐标变换把我绕晕了很久)

这个式子几乎是一个递推式，相当于真正的$$S_0=n$$，然而递推中把$$S_0$$看成了$$m$$

移一下项变成
$$a_{n-m}(n-m)=\sum_{k=0}^{m}a_{n-k}S_{m-k}$$
令$$a'_k=a_{n-k}$$
$$a'_m(n-m)=\sum_{k=0}^{m}a'_{k}S_{m-k}$$
~~多项式求逆板子~~。

一个多项式的逆序和另一个多项式逆序的逆做卷积，众所周知这是多项式除法。只不过保留的项数不只$$n_1-n_2$$。

写成相当简洁的封闭形式是
$$S=xP'(x)\div P(x)$$
这背后到底是什么奥秘？

---

然后今天上Google搜了一下，搜索关键字是本文的标题`Sum of Powers of Roots`。搜索中文内容是永远都啥都搜不到的（无论是谷歌还是百度）。

于是看到了[这篇文章](https://www.qc.edu.hk/math/Resource/AL/Sum%20of%20Powers%20of%20Roots.pdf)

惊讶的发现这是我已经学过的东西，我居然忘了。上次看[zzq的博客](https://www.cnblogs.com/zzqsblog/p/7265111.html)学到了任意一个x数组的k次幂求和，然而那篇的重点是初等对称多项式，所以之前没有联想到。

那篇文章里面有一个简单的证明。

$$P(x)=\prod_{k=1}^{n}(x-x_k)$$
两侧取对数得到
$$\log P(x)=\sum_{k=1}^{n}\log(x-x_k)$$
求导得到
$$\frac{P'(x)}{P(x)}=\sum_{k=1}^{n}\frac{1}{x-x_k}$$
$$=\frac{1}{x}\sum_{k=1}^{n}\frac{1}{1-x_k/x} $$
$$=\frac{1}{x}\sum_{k=1}^{n}\sum_{i=0}^{\infty}(\frac{1}{x})^ix_k^i $$
$$=\frac{1}{x}\sum_{i=0}^{\infty}S_ix^{-i}$$
两侧逆序一下再乘个x就得到了之前找规律的式子

这个憨逼洛谷不支持`\begin{aligned}`
