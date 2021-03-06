---
layout:		post
title:		Hello, world
editdate:	2020-09-25
date:		2019-11-16
author:		wyj
catalog:	true
tags:
    - 博客搭建
---

{:j:.Z .language-js}
{:css:.Z .language-css}
{:b:.Z .language-bash}

> 前人栽树，后人乘凉。fork自[qiubaiying.github.io](https://github.com/qiubaiying/qiubaiying.github.io)

```cpp
//LaTeX测试
```

$$ \Large\textrm{Hello, world!} $$

# 简介

这是来自scz 2021届的前OIer wyj的个人博客。

会从我的[洛谷博客](https://www.luogu.org/blog/474D/)上搬迁**除题解以外的**博文。

# 参考

[基础框架](https://github.com/qiubaiying/qiubaiying.github.io/wiki/%E5%8D%9A%E5%AE%A2%E6%90%AD%E5%BB%BA%E8%AF%A6%E7%BB%86%E6%95%99%E7%A8%8B)

# 功能更新

#### [LaTeX渲染](https://lloyar.github.io/2018/10/08/mathjax-in-jekyll.html)

上面那个LaTeX渲染是残废的，除非你[曾经优化过Chrome字体](https://www.luogu.com.cn/blog/ljf-cnyali/linux-zi-ti-xuan-ran-di-xiu-fu-yu-gai-shan)，字体会变得很丑，和别人的MathJax完全不一样。并且不支持使用`$ xxx $`。

所以我试探了两个小时，最后为了优先加载`HTML-CSS`渲染，改成了
```html
<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-AMS_HTML"></script>
```

然后就可以用正常的字体显示公式了，比如 $F(x)=x^2$。

#### [Prism.js](https://blog.csdn.net/u013961139/article/details/78853544)

这个是代码块的高亮+行号+复制。我选择的所有语言和插件支持，[都可在此处下载到](https://prismjs.com/download.html#themes=prism&languages=markup+css+clike+javascript+bash+c+cpp+glsl+latex+llvm+makefile+markdown+pascal+python+rust+yaml&plugins=line-numbers+toolbar+copy-to-clipboard)。包括C、C++、Makefile、Rust、Pascal、Python、Bash、JavaScript、LaTeX、Markdown、HTML、CSS、Yaml、LLVM IR、GLSL等等。

最开始由于没有安装`c`或者`cpp`，我用了两个````find -type f -exec sed -i 's/```x$/```cpp/g' {} \;````{:b}来批量文本替换。后来我发现这个`clike`高亮的内容太少了，不得不加上`c`和`c++`。

~~不久后发现bug太多了，主要是空行和过长的行的行号不能正确显示，我就把行号插件去掉了。~~

Edit on 2020/03/04：现在又可以了！首先我参考了[这个](https://blog.csdn.net/daijiguo/article/details/79001325)来还原`prism.js`和`prism.css`文件，然后删掉了CSS里面`white-space: pre-wrap;`{:css}一条属性，就可以把错误的换行和空行消除了。

#### [文章置顶](https://too.pub/Jekyll-Sticky-Posts.html)

这个实现相当丑陋，大概是把后面的页中的置顶抽出来扔到第一页，导致每一页的博文数量不一样。然而我不会用`sort`置顶（因为找不到post的变量名）。

#### [本地运行](http://github.tiankonguse.com/blog/2015/10/08/jekyll-run-in-local.html)

完全不用管那么多，直接
```bash
sudo apt install jekyll
jekyll serve --watch --config _config.yml
```

#### 博文显示修改时间

这个我完全没有参考过网上的任何实现，是自己魔改的。我添加了一个`editdate`属性。然后修改了一下index.html和_layouts/post.html，改成首页上只显示修改时间，在博文内部同时显示创建和修改的时间。

就像之前的所有魔改一样，我保持了向后兼容性。具体来说，我把博文内部的显示改成了这样：
```html
{% raw %}Posted by {% if page.author %}{{ page.author }}{% else %}{{ site.title }}{% endif %} on {{ page.date | date: "%B %-d, %Y" }} {% if page.editdate %}/ Edited on {{ page.editdate | date: "%B %-d, %Y" }}{% endif %}{% endraw %}
```

#### 去除deprecated的用法

自从升级到20.04之后发现很多Jekyll和Liquid的写法已经被弃用了。本地跑Jekyll时出现了一大堆的warning，比如说使用了`gems`而非`plugins`，Liquid的`if`语句里使用了多余的`{% raw %}{{}}{% endraw %}`等等，按照他的提示修改就可以了。甚至Jekyll自己的一些实现细节也被Ruby语言认为是弃用的，只需要按照[这篇文章](https://piechowski.io/post/last-arg-keyword-deprecated-ruby-2-7/)说的，加上几个`**`就可以修复了。

#### [站点地图](http://www.independent-software.com/generating-a-sitemap-xml-with-jekyll-without-a-plugin.html)

我参照这个链接里面的写法魔改了一下，增加了被置顶的博文的优先级。

#### [文章加密](/2020/06/08/%E5%8A%A0%E5%AF%86%E6%B5%8B%E8%AF%95/)

参考了[集训队大爷yhx的设置](https://yhx-12243.github.io/OI-transit/)，使用MD5判断密码是否正确（这只是为了用户体验），如果密码正确的话用其制作出密钥解密DES。基本上可以保证无法被破解。并且中文这样做之后会变成乱码，所以我额外加上了一个`encodeURIComponent`{:j}。

#### 内联代码高亮

直接使用kramdown的扩展语法就行了，比如说把`` `int i=0;` ``改成`` `int i=0;`{:.language-cpp}``。如果嫌这个class太长了的话，可以先定义`{:c: .language-cpp}`（每篇文章只要定义一次），然后用`` `int i=0;`{:c}``就行了。我修改了所有新博文的内联代码，让它们具有了高亮。从洛谷博客上搬过来的旧文章就懒得改了。

本地运行已经完美了，但！是！github pages上面死活显示不出来高亮，还是`language-plaintext`。不知道是出了什么奇怪的bug，**我在google上怎么搜都搜不到该如何解决**。只好自己瞎摸索了。发现我本地不会给所有的`<code>`标签添加`language-plaintext`这个class（包括没有添加高亮的内联代码），只有服务器上会。

我的`{:.language-rust}`被覆盖了。于是我尝试显式地指定class，看看可不可以覆盖掉它的；为了检测到底是我指定class失败了，还是覆盖失败了，我同时添加了几个class：`{: class="fuck shit language-rust"}`。发现现在我的class就变成了与它的共存了：元素属性变成`fuck shit language-rust language-plaintext`，覆盖还是失败的。

于是我直接在_layouts/post.html中加上一行jQuery把它的class送上西天：`$(()=>$("*").removeClass("language-plaintext"));`{:j}现在只有我说了算了，就终于有了正确的高亮。奇怪的是，我必须多添加一个像`fuck shit`这样的没用的class，否则它不理我，会把我孤零零的`language-rust`直接吞掉同归于尽。这个情况更加让我倾向于认为这是个github的bug。

所以把`{:c: .language-cpp}`改成`{:c:.Z .language-cpp}`就可以照常使用了。
