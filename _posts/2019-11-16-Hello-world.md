---
layout:		post
title:		Hello
subtitle:	world
date:		2019-11-16
author:		wyj
catalog:	true
tags:
    - 伪置顶
---

>前人栽树，后人乘凉。fork自[qiubaiying.github.io](https://github.com/qiubaiying/qiubaiying.github.io)

```cpp
//LaTeX测试
```

$$ \Large\textrm{Hello, world!} $$

# 简介

这是sczOIer wyj的个人博客。暂时没有置顶功能。

会从我的[洛谷博客](https://www.luogu.org/blog/474D/)上搬迁**除题解以外的**博文。

# 参考

[基础框架](https://github.com/qiubaiying/qiubaiying.github.io/wiki/%E5%8D%9A%E5%AE%A2%E6%90%AD%E5%BB%BA%E8%AF%A6%E7%BB%86%E6%95%99%E7%A8%8B)

[LaTeX渲染](https://lloyar.github.io/2018/10/08/mathjax-in-jekyll.html)

上面那个LaTeX渲染是残废的，除非你[曾经优化过Chrome字体](https://www.luogu.com.cn/blog/ljf-cnyali/linux-zi-ti-xuan-ran-di-xiu-fu-yu-gai-shan)，字体会变得很丑，和别人的MathJax完全不一样。并且不支持使用`$ xxx $`。

所以我试探了两个小时，最后为了优先加载`HTML-CSS`渲染，改成了
```html
<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-AMS_HTML"></script>
```

然后就可以用正常的字体显示公式了，比如 $F(x)=x^2$。

[Prism.js](https://blog.csdn.net/u013961139/article/details/78853544)

这个是代码块的高亮+行号+复制。我目前选择了`c`,`c++`,`python`,`bash & shell`,`pascal`,`yaml`,`html`,`markdown`,`Latex`,`javascript`,`CSS`的高亮。

最开始由于没有安装`c`或者`cpp`，我用了两个`find -type f -exec sed -i 's/```x$/```cpp/g' {} \;`来批量文本替换。后来我发现这个`clike`高亮的内容太少了，不得不加上`c`和`c++`。
