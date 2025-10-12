---
layout:		post
title:		circle packing问题的一种近似算法
subtitle:	模拟退火的妙用
date:		2018-08-03
author:		wyj
catalog:	true
tags:
    - Qt
    - 数值计算与近似
---

（假装自己在写论文）

今天下午心血来潮写了一个circle packing的程序。

众所周知，circle packing是一个很困难的问题，并且它在折纸中起了很大的作用（生成给定数量和大小的flap同时最大化对纸张的利用）。如果我没有记错的话，n=7时的circle packing还是最近找到的最佳解答（来自Origami Design Secrets）。

对circle packing（简化版）的定义：在单位大小的正方形中找到n个等半径的圆，使得任何两个圆不重叠，最大化这个半径。注意：**圆不一定在正方形内，但圆心一定在**（其实圆在不在正方形内都是等价的）

使用模拟退火算法近似解决本问题。这里估价函数定义为

$$Fitness(p):=\sum_{i=0}^{N-1}(1-{\min_{j\neq i}{dis(p_i,p_j)}})^2$$

(为什么是用1减去？实际上我一开始打算二分一个mid，然后用mid减去，判断是否可行，后来莫名其妙地发现用1就行了。)

(为什么不是直接把最小的距离加起来取反？实践中这样做一直收敛不到最优解，可能有什么我不知道的玄学原因。)

我居然只写了一个小时，自己都没想到。效果出乎预料的好。很多解有着惊人的对称美。

最难的地方在于图形操作，本蒟蒻不会Ubuntu下的GUI，于是就把图形写到了.ppm里，使用display命令查看。由于画图速度的原因（~~我会告诉你是因为画圆太难写了吗~~），这里只画出了圆心。

C++11代码如下：

```cpp
#include<bits/stdc++.h>
using namespace std;
const int N=10,scale=300;
struct point{
	double x,y;
	point(double x=0,double y=0):x(x),y(y){}
}p[N],q[N];
int gr[scale][scale];
point operator + (point a,point b){return point(a.x+b.x,a.y+b.y);}
double dis(point a,point b){return hypot(a.x-b.x,a.y-b.y);}
double sqr(double x){return x*x;}
double ftns(point *p){
	double ret=0;
	for(int i=0;i<N;i++){
		double mn=1e9;
		for(int j=0;j<N;j++)if(j!=i)mn=min(mn,dis(p[i],p[j]));
		ret+=sqr(mn-1);
	}
	return ret;
}
double nm(double x){return x>0?x<1?x:1:0;}
point nm(point x){return point(nm(x.x),nm(x.y));}
void show(){
	system("killall display");
	memset(gr,0,sizeof gr);
	for(int i=0;i<N;i++){
		int x=p[i].x*scale,y=p[i].y*scale;
		for(int j=x-1;j<x+2;j++)
			for(int k=y-1;k<y+2;k++)if(j>=0 && k>=0 && j<scale && k<scale)
				gr[j][k]=1;
	}
	FILE *f=fopen("1.ppm","wb");
	fprintf(f,"P6\n%d %d\n255\n",scale,scale);
	for(int i=0;i<scale;i++)
		for(int j=0;j<scale;j++){
			unsigned char c[3];
			c[0]=c[1]=c[2]=255-gr[i][j]*255;
			fwrite(c,1,3,f);
		}
	fclose(f);
	system("nohup display ./1.ppm &");
	system("sleep 1");
}
int main(){
	uniform_real_distribution<double> u(0,1),v(-1,1);
	default_random_engine e;
	e.seed(clock());
	for(int i=0;i<N;i++)p[i]=point(u(e),u(e));
	int cnt=0;
	for(double T=1;T>0.001;T*=0.999){
		for(int i=0;i<N;i++)q[i]=nm(p[i]+point(v(e)*T,v(e)*T));
		if(exp((ftns(p)-ftns(q))/T)>u(e))
			memcpy(p,q,sizeof p);
		if(++cnt%500==0)show();
	}
	return 0;
}
```
--------------
# 2018.10.14 UPD:
今晚把这个程序成功转为了Qt程序。**人生第一个Qt实用程序！**

面临的困难主要有：
1. 无法在主线程里用sleep等待计算结束再画图（会失去响应）。  
这个容易解决，和windows下一样，开一个专用于计算的子线程即可。问题主要在于，Qt的OOP太过变态，必须单独使用一个.h,一个.cpp,一个单独的类来搞这个事情。
2. **没有全局变量，特别是extern的数组**。网上找了一堆的解决方法，什么OOP至极的一个全局的类中的static成员之类的，个人认为丑的要死，于是回归C语言寻找。  
网上找到C写法没有几个能通过编译，最后是自己试错试出来的。

下面可能是唯一通过编译的写法：
```cpp
// vars.h
extern QPointF p[N]; //必须有extern和数组大小。
```
```cpp
//thread.h
#include "vars.h"

```
```cpp
//thread.cpp
#include “thread.h”
QPointF p[]; //必须没有extern，没有数组大小
```
```cpp
//mainwindow.h
#include "thread.h"
```
```cpp
//mainwindow.cpp
#include "mainwindow.h"
extern QPointF p[]; //必须有extern，没有数组大小
```
是不是非常莫名其妙？

别的都是些小问题。最后终于完成了，效果如下，**比想象中快很多**。

![效果图](/img/luogu_img/37904.png)
