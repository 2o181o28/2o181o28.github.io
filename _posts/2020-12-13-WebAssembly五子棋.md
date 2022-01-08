---
layout:		post
title:		用WebAssembly实现的五子棋程序
subtitle:	AI来自snz
date:		2020-12-13
editdate:	2022-01-08
author:		wyj
catalog:	true
tags:
    - 博客搭建
    - WebAssembly
---

{:c:.Z .language-cpp}
{:j:.Z .language-javascript}
{:h:.Z .language-html}

这是继[2048](http://2o181o28.github.io/2048)之后的又一个我给博客添加的小游戏。[网址](/gomoku/)。推荐用Firefox浏览，因为对于此程序而言，Firefox的WebAssembly速度比Chrome快1.5倍左右，棋力会有显著提高。

之前我给snz的AI添加了piskvork需要的接口，本来就只是自己在本地玩玩的。然而上周日学习到了WebAssembly的正确使用方法，我就忽然产生了巨大的兴趣，想把这个AI整个编译成WebAssembly，放到我自己的博客上。然而写着写着才发现，这个程序的难度比2048大得多。我使用了整整一周的几乎所有空闲时间才完成了初步的开发。

# WebAssembly部分

把snz的C++程序原封不动地搬过来，就可以直接用了。唯一的小修小补是，之前的版本是通过标准输入输出与别的进程交互的，现在肯定不能这么做，需要像一个库一样被调用。于是我对主程序稍作了一些修改，这里略过不提了。

编译命令应该是这样的，而不是使用`-s SIDE_MODULE=1`开关；如果你使用了那个开关，那么就不会生成胶水js文件了，所有wasm和js之间的交互都得要自己实现，程序稍微复杂点难度就会直接上天。

```bash
. /path/to/emsdk/emsdk_env.sh --build=Release
em++ gomoku.cpp -s ALLOW_MEMORY_GROWTH=1 -s "EXTRA_EXPORTED_RUNTIME_METHODS=['cwrap','ccall']" -s "EXPORTED_FUNCTIONS=['_handler']" -o gomoku.js -std=c++20 -O3 -Wall -Wextra -Wno-shift-op-parentheses
```

导出了`ccall`和`cwrap`，用来方便地把C++函数包装成js函数。比如说我现在有一个`extern"C" int handler(char *buf)`{:c}，是没办法用js直接调用的，因为js没有`char*`{:c}这样的类型，不能直接传参。但是用`let send=Module.cwrap("handler","number",["string"]);`{:j}把它变成js函数之后，就可以直接把一个js的`string`当做参数来调用了。

# Web worker

这是此程序的编写过程中，我学到的一个新知识。因为js的代码永远是单线程执行的，虽然有成熟的异步机制，但也只能是重新安排下事件的顺序，不能打断控制流，同时做多件事。而这是此程序不可缺少的部分：不可能AI在后台运算时，就让GUI全部锁死吧？所以需要引入一个多线程的机制来处理，Web workers就是现代的浏览器（指IE除外的所有浏览器）对此提供的工具。我只需要编写一个worker.js来计算，在主线程里与它通信，就可以同时处理计算和UI交互这两件事了。

然而问题来了：我只知道如何在html中加载wasm，使用`<script src="/js/gomoku/gomoku.js"></script>`就可以了。如何在一个js中加载wasm呢？我在网上搜了很久，都没有找到一个合适的解决方案。大家貌似都是手工加载的（调用`WebAssembly.instantiateStreaming()`，然后手动定义各种交互规则和配置），这肯定不是我想要的。后来我试着直接把emscripten生成的js魔改一下，当做worker来用，居然成功了！可惜的是，这个生成的胶水js会随着我每次编译cpp而被修改，不能保持我的魔改。我本来想将就着用，却忽然发现了一个很好的解决方案：使用`importScripts("/js/gomoku/gomoku.js");`，我可以在worker脚本里include胶水脚本，从而优美地解决了问题。

# 异步编程

上次的2048中几乎没有异步的部分，除了从网上直接复制了一个`sleep()`函数的实现之外，只要无脑`async/await`就可以解决一切事。但这次的情况要复杂一些，我要自己写一些`Promise`。比如说我要等worker初始化完成，才能向worker发送信息，这个“等待初始化”的过程就需要我自己写`Promise`：

```js
worker=new Worker("/js/gomoku/worker.js");
......
let p=new Promise(res=>{
	worker.onmessage=async e=>{
		......
		res();
	};
});
await p;
```

又比如我要等图片下载完成才能开始绘制，也需要自己写类似的`Promise`。

和worker的交互过程中，我也被并行的问题困扰了很久。比如说现在worker还在计算，我想发条消息让它终止，然而worker自己也是个js，它自身是单线程的，不能在计算时接收信息，所以做不到这个需求。然而这是此程序所必需的，我只能退而求其次，用`worker.terminate()`把它强关，然后重开，从而做到终止计算。

我使用一个`is_busy`变量表示现在worker是否可以接收新消息，却因此出现了一些问题。比如说新局开始时，如果AI是先手，我需要传递一个`BEGIN`命令让它下第一步，此时AI会被占用所以`is_busy`应该被设置成`true`，于是我自然地写出了这样的代码：

```js
worker.onmessage=async e=>{
	......
	is_busy=false;
};
......
worker.postMessage(`START ${len}`);
worker.postMessage(`INFO timeout_turn ${timeout}`);
if(game_type===0){
	is_busy=true;
	worker.postMessage("BEGIN");
}
```

然而这个`is_busy`却没有起到我想象中的锁的作用，调用`BEGIN`命令之后有时它还是`false`{:j}。后来我才意识到，由于worker和主程序是并行执行的，前面两个命令的返回有可能发生在我进行`is_busy=true;`{:j}这个赋值之后，从而在`onmessage`中把它重新变回了`false`{:j}。于是我修改了代码，仅允许`BEGIN`命令自己返回时把`is_busy`变回`false`{:j}，就正常了。

# 图形界面

这个图形界面比C++稍繁琐一些，但灵魂还是canvas。canvas中需要绘制棋盘，我就直接复制了piskvork的skin，不仅比自己画图方便多了，而且也更好看。

我打算左右分栏，左边放棋盘，右边放配置用的控件，但是很快就发现了问题：棋盘必须是正方形的，而我还不会用css让一个元素保持正方形。我从网上找到了一些tweak，却发现它们都只能让元素占据的空间变成正方形，不能让它的实际大小保持正方形。没办法，我只好在算高度时再模拟一遍算宽度的过程，写出`height:min(calc(800px*0.65),60vw);`这样丑陋的代码。

在右边放控件，别的控件一切顺利，就是按钮让我有点伤脑筋。默认的`<button>`元素在不同的浏览器上会有不同的显示结果，于是我想用bootstrap的`.btn`来表示按钮，却发现它被我的博客主题中的`.btn`覆盖了，变得很丑。后来我忽然想起来默认`<button>`的样式其实也是可以配置的，就抄了一遍2048里我的配置，让按钮变得好看一点。

按钮上的内容也让我绞尽脑汁。我想要创建一组用来调控进度的按钮，却不愿意为了这点小事去画几个箭头再加载图片之类的，就直接用Unicode里对应字符来显示了。电脑上显示一切正常，然而手机上左箭头和右箭头居然不对称，这也太丑了吧！

还有一个事非常奇怪：我不能直接得到一个radio group选中的值是第几个值。然而我才不想一个`if`{:j}一个`if`{:j}地判断，就魔改网上的代码写了个统一的解决方案（这里`/3`是因为我每个选项由3个元素组成）：
```js
let checked_elem=$("input[name='game_type']:checked")[0];
let new_type=Array.prototype.indexOf.call(checked_elem.parentNode.children,checked_elem)/3;
```

而且js居然不能直接得到一个`Image`变量在某个坐标处的颜色，我必须创建一个临时的`canvas`，把这个`Image`画进去，然后再取`canvas`某点处的颜色，才能得到我想要的结果。这也太丑了吧。

我需要维护一个“历史记录”，来支持悔棋、复盘之类的功能，需要把当前的棋盘数组拷到栈里面去。然而js连个deep clone的实现都没有，我还必须折腾一发，把棋盘给`JSON.stringify`，再`JSON.parse`用于复制，所幸这和把当前局面保存到localStorage以及从localStorage中加载的过程一模一样，可以复用代码，不然真要烦死了。

写下来最大的感受就是ES6的模板字符串是真的好用，比之前2048里那种+来+去的写法舒服多了。

# 2022-01-08 UPD: 移动设备兼容性

之前我的这个网页在手机上是完全无法查看的，点击棋盘或者按钮都是毫无反应。实际上这是因为我的大`<div>`没有高度，导致棋盘所在位置被footer覆盖。而`<div>`没有高度又是因为使用了float属性来布局。这个解决其实非常简单，按照[这个网页](https://www.jianshu.com/p/a1724eeb07a6)中说的，加一个`<div style="clear:both"></div>`{:h}就行了。

现在解决了棋盘点击的问题，但按钮仍然没有足够的位置来显示，导致文字溢出屏幕。因为原本的左右分栏的布局并不适合在手机上显示，我就稍微改了下css，让在手机上变成上方显示棋盘，下方显示文字和按钮。还是使用[2048](/2020/02/25/2048/#%E6%9B%B4%E6%96%B0%E7%A7%BB%E5%8A%A8%E8%AE%BE%E5%A4%87%E5%85%BC%E5%AE%B9%E6%80%A7)里的方法来为不同大小的屏幕生成不同的css。
