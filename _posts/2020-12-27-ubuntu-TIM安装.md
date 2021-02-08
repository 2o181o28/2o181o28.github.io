---
layout:		post
title:		新版deepin TIM等软件在Ubuntu上的安装办法
date:		2020-12-27
editdate:	2021-02-08
author:		wyj
catalog:	true
tags:
    - linux
---

{:b:.Z .language-bash}

我正在使用的wine TIM版本是非常古老的，古老到腾讯可能不太支持了，不能传图片，不能显示别人分享的网址，（几乎）不能显示图片，也（几乎）不能收文件。所以使用过程中问题很大。然而现在TIM等等的商业软件被从各种仓库中删除了，导致更新一个正常的TIM版本非常困难，折腾了我整整一个晚上。

# 下载方法

**在root权限下**执行以下的命令:
```bash
echo "deb [by-hash=force] https://sucdn.jerrywang.top / " >> /etc/apt/sources.list
apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 0E41D354A29A440C
apt update
apt install com.qq.tim.spark 
```
当然你可以卸磨杀驴，在安装完成之后就把这个奇奇怪怪的源删掉：
```bash
sed -i "/jerrywang/d" /etc/apt/sources.list
apt-key del "9D9A A859 F750 24B1 A1EC  E16E 0E41 D354 A29A 440C"
apt update
```

# 调整字体

我是在虚拟机里做的实验，虚拟机里一切正常，装完之后TIM就可以直接用了。然而我在宿主机上遇到了一些问题：UI中的所有简体字全都变成了方块！（很奇怪的是，内容里是正常的）

这是个棘手的问题，我绕了不少弯路，最后是用[这篇文章](https://lossyou.com/post/%E5%BD%BB%E5%BA%95%E8%A7%A3%E5%86%B3wine3.0%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81%E9%97%AE%E9%A2%98)里的办法解决的。或许有人要问了：你不是没有Windows吗，是怎么从Windows下把字体复制过来的呢？这你就不懂了吧，我在之前[装QQ音乐](/2020/03/17/wine%E8%BF%90%E8%A1%8CQQ%E9%9F%B3%E4%B9%90/)的时候还是有Windows的，那时候我就已经把Windows里的字体复制到普通wine里去了，所以我只需要把普通wine下的字体文件拷到deepinwine里去就可以正常运行了。

当然，如果你发现自己压根没有调整字体，显示就直接是正常的了，不要高兴得太早。我的虚拟机里TIM的字体乍一看是正常的，然而点开“群公告”里面就全是方块了。所以建议就算没有发现方块，也要调整字体。

# 效果

UI当然变得非常现代化而美观。字体不再发虚了，图片和网址也能正常显示了，文件也能正常下载了。遗憾的是，仍然不能正常发送图片。由于隐私<del>懒</del>的原因，我无法提供截图。
