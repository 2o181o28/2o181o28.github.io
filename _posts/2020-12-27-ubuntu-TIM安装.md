---
layout:		post
title:		新版deepin TIM等软件在Ubuntu上的安装办法
date:		2020-12-27
editdate:	2022-04-22
author:		wyj
catalog:	true
tags:
    - linux
---

{:b:.Z .language-bash}

我正在使用的wine TIM版本是非常古老的，古老到腾讯可能不太支持了，不能传图片，不能显示别人分享的网址，（几乎）不能显示图片，也（几乎）不能收文件。所以使用过程中问题很大。然而现在TIM等等的商业软件被从各种仓库中删除了，导致更新一个正常的TIM版本非常困难，折腾了我整整一个晚上。

**2022-04-22 UPD:**后来这个方法完全失效了，让我又折腾了一小时来修复它。下面的是修复后的方法，在20.04和22.04上都能用。

# 下载方法

**在root权限下**执行以下的命令:
```bash
echo "deb [by-hash=force] https://d.store.deepinos.org.cn / " >> /etc/apt/sources.list
apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 0E41D354A29A440C
apt update
apt install com.qq.tim.spark 
```
下载微信等软件也是类似的。
当然你可以卸磨杀驴，在安装完成之后就把这个奇奇怪怪的源删掉：
```bash
sed -i "/deepin/d" /etc/apt/sources.list
apt-key del 0E41D354A29A440C
apt update
```

# Ubuntu 22.04上额外要做的

如果你老老实实地按照上面的步骤去做了，你就会得到每一个Ubuntu用户都喜闻乐见的一段文字：

> 下列软件包有未满足的依赖关系：  
 deepin-wine5-i386:i386 : 依赖: libldap-2.4-2:i386 (>= 2.4.7) 但无法安装它
 
虽然网上有一大堆遇到这个问题的人，但我没能搜到解决方案。但不要慌，这个实际上是可以解决的。从20.04的软件源中把[这个deb](https://launchpad.net/ubuntu/focal/i386/libldap-2.4-2/2.4.49+dfsg-2ubuntu1.8)下载下来手动安装即可。安装微信的时候需要用到64位的`libldap-2.4-2`，也可以直接[下载](https://launchpad.net/ubuntu/focal/amd64/libldap-2.4-2/2.4.49+dfsg-2ubuntu1.8)。如果你已经安装了别的版本的libldap也没问题，幸运的是这个软件的多个版本可以共存，不会有依赖冲突。

# 调整字体

我是在虚拟机里做的实验，虚拟机里一切正常，装完之后TIM就可以直接用了。然而我在宿主机上遇到了一些问题：UI中的所有简体字全都变成了方块！（很奇怪的是，内容里是正常的）

这是个棘手的问题，我绕了不少弯路，最后是用[这篇文章](https://lossyou.com/post/%E5%BD%BB%E5%BA%95%E8%A7%A3%E5%86%B3wine3.0%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81%E9%97%AE%E9%A2%98)和[这篇文章](https://blog.csdn.net/zengxyuyu/article/details/54620104)里的办法解决的。或许有人要问了：你不是没有Windows吗，是怎么从Windows下把字体复制过来的呢？这你就不懂了吧，我在之前[装QQ音乐](/2020/03/17/wine%E8%BF%90%E8%A1%8CQQ%E9%9F%B3%E4%B9%90/)的时候还是有Windows的，那时候我就已经把Windows里的字体复制到普通wine里去了，所以我只需要把普通wine下的字体文件拷到deepinwine里去就可以正常运行了。

当然，如果你发现自己压根没有调整字体，显示就直接是正常的了，不要高兴得太早。我的虚拟机里TIM的字体乍一看是正常的，然而点开“群公告”里面就全是方块了。所以建议就算没有发现方块，也要调整字体。

# 效果

UI当然变得非常现代化而美观。字体不再发虚了，图片和网址也能正常显示了，文件也能正常下载了。遗憾的是，仍然不能正常发送图片。由于隐私<del>懒</del>的原因，我无法提供截图。
