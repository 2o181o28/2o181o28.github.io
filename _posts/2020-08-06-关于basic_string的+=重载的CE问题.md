---
layout:		post
title:		关于basic_string的+=重载的CE问题
subtitle:	NOI Linux就是垃圾，不接受反驳
date:		2020-08-06
author:		wyj
catalog:	true
tags:
    - OI
    - C++
---

{:c:.Z .language-cpp}

（完全合法的）C++代码：
```cpp
struct st{int x,y;};
basic_string<st> a;
int x=10;
a+={x,0};
```
在某些吃了屎的编译器中就会CE，正常的人类可用的编译器都可以得出正确的结果。

以下是使用LOJ的C++11(NOI)选项进行黑盒测试时，得出的一些猜想。

# 错误的测试方法

最开始我没有使用变量`x`，写成了`a+={0,1};`{:c}。结果发现**在正常的编译器中都会CE**。这是因为`basic_string`的`+=`的rhs可以是另一个`const basic_string<T> &`{:c}，所以编译器会尝试用`{0,1}`构造出一个`basic_string`作为rhs。碰巧`basic_string<T>`{:c}有如下的[构造函数](https://zh.cppreference.com/w/cpp/string/basic_string/basic_string)（我从来没听说过还能这么构造）：
```cpp
basic_string( const T* s,
              size_type count,
              const Allocator& alloc = Allocator() );
```
又是碰巧，在C++中$0$和其他整数是区别对待的：只有$0$可以被隐式转换成一个（任意类型的）指针。这个设计就很sb，但是为了保证宏`NULL`可以被正常定义，这是唯一的解决方案。（C++11中引入了`nullptr`解决这个历史遗留问题，但是与本文内容无关，就不展开了）。总之无论如何，`{0,1}`既可以被理解成`(st){0,1}`{:c}，也可以被编译器曲解成“从$0$号地址上提取出长度为$1$的一段内存，构造一个`basic_string`”，自然是有歧义的。所以这个测试方法是错的，不能说明任何事。

# “歧义”是曲解成了啥？

从LOJ上的编译错误信息可以看出，它的确是在努力尝试把右边变成一个basic_string来让我CE。然而由于某个吃了屎的编译器不能给出人类可以理解的错误解释（Clang从一开始就与其形成了鲜明的对比，不是直到高版本才变得这么强的），没有办法获得更进一步的信息了。

所以得要看看它到底在妄图使用哪条构造函数扳倒我。翻遍构造函数的列表，发现有三种构造函数可能会发生歧义：一条是前文提到的`basic_string(const T*s,size_t count)`{:c}；一条是`basic_string(size_t count,T ch)`{:c}（和`vector`一样的用`count`个`T`实例的副本来初始化的语法）；另一条是`template<class it> basic_string(it first,it last)`{:c}，使用一个范围构造。此时我把`st`的构造函数删除，以重新引入所谓“歧义”，同时尝试替换成员变量`x`和`y`的类型，发现：

- x:char,y:int ： **编译成功**
- x:short,y:int ： **编译成功**
- x:double,y:int ： **编译成功**
- x:long long,y:int ： **编译成功**
- 交换前几条中x和y的类型 ： **编译成功**
- x:char,y:char ： **编译失败**
- x:short,y:short ： **编译失败**
- x:double,y:double ： **编译失败**
- x:long long,y:long long ： **编译失败**

很明显，只有`x`和`y`类型一样时，编译会失败。所以罪魁祸首被确定了：`template<class it> basic_string(it first,it last)`{:c}，因为这是唯一一个当且仅当`x`和`y`类型相同时会被尝试到的构造函数。

于是我看了下我自己电脑上的头文件：`/usr/include/c++/10/bits/basic_string.h`，发现这个模板的声明里明明指明了在`__cplusplus >= 201103L`{:c}时，会添加`typename = std::_RequireInputIter<_InputIterator>`{:c}，所以模板实例化应该是会失败的：`double`怎么可能满足`_RequireInputIter`呢？并且我在LOJ上面测了测，`__cplusplus >= 201103L`{:c}的确是满足的。所以这应该还是低版本g++中，构造函数声明内部没有正确require的问题。

# 在NOI Linux的LiveCD上验证猜想

反正下载一个NOI Linux的ISO是飞快的，可以现场测试一下。毕竟安装一个系统还是太慢了，我等不及，就用VirtualBox新建个虚拟机，导入ISO，直接在LiveCD中看了。（我之前验证`-fsanitize=undefined`的等价替代品时也是这么做的，可惜曾经下载的ISO已经随我的HDD逝去了）。果然，这个构造函数**没有判`__cplusplus >= 201103L`{:c}**，没有加上C++11的require。归根结底，还是C++11支持不完全导致的锅。

![](/img/20200806/1.jpg)

总结一下CE的原因：

- 垃圾编译器看到`a+={x,0};`{:c}，尝试把`{x,0}`解释成一个`st`类型对象的列表初始化；解释成功
- `basic_string`不仅可以`+=`一个元素，也可以`+=`另一个`basic_string`。所以垃圾编译器尝试使用`{x,0}`作为`basic_string`的构造函数
- 模板替换全部失败了，除了`template<class it> basic_string(it first,it last)`{:c}这个构造函数，令`it=int`替换成功
- 由于C++11支持不完全，没有在模板参数中加入`_RequireInputIter`，否则`_RequireInputIter<int>`{:c}会模板实例化失败（由于`enable_if`不成立），令此次替换失败
- 然而替换全都成功了，所以`{x,0}`就有了两个可行的解释方法，导致“歧义”，垃圾编译器手足无措，只好CE了

----

$$\Large{\downarrow\textrm{制作过程}\downarrow}$$

![](/img/20200806/1.png)
