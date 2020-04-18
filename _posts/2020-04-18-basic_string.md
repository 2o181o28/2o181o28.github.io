---
layout:		post
title:		basic_string的优点
date:		2020-04-18
author:		wyj
catalog:	true
tags:
    - OI
    - C++
---

我一年多之前就开始用`basic_string`替代`vector`了。现在我打算详细地讲解一下`std::basic_string<T>`相比`std::vector<T>`的优越之处。

# 速度

参考[n方过十万对比](https://2o181o28.github.io/2018/10/22/n%E6%96%B9%E8%BF%87%E5%8D%81%E4%B8%87%E5%AF%B9%E6%AF%94/)，可以看出`basic_string`以微弱优势快于`vector`。

# 语法糖

这个才是关键。首先，`basic_string`拥有`vector`拥有的**几乎全部**成员函数，比如说常用的`push_back`、`insert`、`erase`、`resize`等等。甚至释放内存函数`shrink_to_fit`也有。唯一缺少的是`emplace`系列，然而**`basic_string`只能用来存放POD**，所以说`emplace`并不可能给`basic_string`带来提速，没有存在的必要。

下面用几段C++代码来展示`basic_string`的方便之处。

```cpp
basic_string<int> B={2,3,4};
vector<int> V={2,3,4};
// 相同的初始化列表构造能力
```
```cpp
V.push_back(3);
B+=3;
// 最常用的操作：尾部增加元素，basic_string极其简短
```
```cpp
V.insert(V.end(),{4,3,2});
B+={4,3,2};
// 次常用的操作：尾部添加多个元素，basic_string更加简短
```
```cpp
struct edge{int v,w;};
basic_string<edge> Be[1<<18];
// basic_string也可以用来存放简单的结构体
```
```cpp
for(int&i=cur[p];i<(int)V[p].size();i++){
	......
}
for(int i:B[p].substr(cur[p])){
	......
	cur[p]++;
}
// 当前弧优化，简短了很多
```
```cpp
int p=V.size()*0.618;
rotate(V.begin(),V.begin()+p,V.end());

int pos=B.size()*0.618;
B=B.substr(p)+B.substr(0,p);
// 同样，使用substr和+实现简短的循环移位，也不需要强行记忆std::rotate的参数
```
```cpp
for(int i:V)DoManyThingsWithI(i);
for(int i:V1)DoManyThingsWithI(i);

for(int i:B+B1)DoManyThingsWithI(i);
// 可以统一处理多个数组之内的数，而不需要声明临时变量
```
```cpp
find(V.begin()+k,V.end(),3);
B.find(3,k);
B.find({4,3,2},k);
// 简短地查找某个元素，一样可以指定起始点，并且多出了查找子串的功能
```
