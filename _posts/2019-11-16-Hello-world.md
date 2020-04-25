---
layout:		post
title:		Hello, world
date:		2020-03-28
postdate:	2019-11-16
author:		wyj
catalog:	true
top:		true
tags:
    - 博客搭建
---

>前人栽树，后人乘凉。fork自[qiubaiying.github.io](https://github.com/qiubaiying/qiubaiying.github.io)

```cpp
//LaTeX测试
```

$$ \Large\textrm{Hello, world!} $$

# 简介

这是sczOIer wyj的个人博客。~~暂时没有置顶功能。~~现在有了。

会从我的[洛谷博客](https://www.luogu.org/blog/474D/)上搬迁**除题解以外的**博文。

# 参考

[基础框架](https://github.com/qiubaiying/qiubaiying.github.io/wiki/%E5%8D%9A%E5%AE%A2%E6%90%AD%E5%BB%BA%E8%AF%A6%E7%BB%86%E6%95%99%E7%A8%8B)

# 功能更新

### [LaTeX渲染](https://lloyar.github.io/2018/10/08/mathjax-in-jekyll.html)

上面那个LaTeX渲染是残废的，除非你[曾经优化过Chrome字体](https://www.luogu.com.cn/blog/ljf-cnyali/linux-zi-ti-xuan-ran-di-xiu-fu-yu-gai-shan)，字体会变得很丑，和别人的MathJax完全不一样。并且不支持使用`$ xxx $`。

所以我试探了两个小时，最后为了优先加载`HTML-CSS`渲染，改成了
```html
<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-AMS_HTML"></script>
```

然后就可以用正常的字体显示公式了，比如 $F(x)=x^2$。

### [Prism.js](https://blog.csdn.net/u013961139/article/details/78853544)

这个是代码块的高亮+行号+复制。我目前选择了`c`,`c++`,`python`,`bash & shell`,`pascal`,`yaml`,`html`,`markdown`,`Latex`,`javascript`,`CSS`的高亮。

最开始由于没有安装`c`或者`cpp`，我用了两个`find -type f -exec sed -i 's/```x$/```cpp/g' {} \;`来批量文本替换。后来我发现这个`clike`高亮的内容太少了，不得不加上`c`和`c++`。

~~不久后发现bug太多了，主要是空行和过长的行的行号不能正确显示，我就把行号插件去掉了。~~

Edit on 2020/03/04：现在又可以了！首先我参考了[这个](https://blog.csdn.net/daijiguo/article/details/79001325)来还原`prism.js`和`prism.css`文件，然后删掉了CSS里面`white-space: pre-wrap;`一条属性，就可以把错误的换行和空行消除了。

### [文章置顶](https://too.pub/Jekyll-Sticky-Posts.html)

这个实现相当丑陋，大概是把后面的页中的置顶抽出来扔到第一页，导致每一页的博文数量不一样。然而我不会用`sort`置顶（因为找不到post的变量名）。

### [本地运行](http://github.tiankonguse.com/blog/2015/10/08/jekyll-run-in-local.html)

完全不用管那么多，直接
```bash
sudo apt install jekyll
jekyll serve --watch --config _config.yml
```

### 博文修改时间排序

由于我经常会“挖坟”，很多几年前的文章现在还在不停更新，大大增加了让人找到这些更新内容的难度。所以我打算按照修改时间排序文章。

这个我完全没有参考过网上的任何实现，是自己魔改的。我添加了一个`postdate`属性，把`date`变成最后一次修改的时间。然后修改了一下index.html和_layouts/post.html，改成首页上只显示修改时间，在博文内部同时显示创建和修改的时间。

就像之前的所有魔改一样，我保持了向后兼容性。这是通过使用Liquid的`default`过滤器做到的。具体来说，我把博文内部的显示改成了这样：
```html
{% raw %}Posted by {% if page.author %}{{ page.author }}{% else %}{{ site.title }}{% endif %} on {{ page.postdate | default: page.date | date: "%B %-d, %Y" }} {% if page.postdate %}/ Edited on {{ page.date | date: "%B %-d, %Y" }}{% endif %}{% endraw %}
```
