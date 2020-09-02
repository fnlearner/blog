---
title: npm包的发布
date: 2020-09-02 22:01:21
tags: npm
---

**趁趁趁着还不太忙，补个npm包的发布**

+ 那么首先就是`npm init -y`初始化一个npm仓库
+ 然后`touch index.js`创建index文件
+ 安装`chalk figlet commander`这几个包，⚠️一定一定要装开发依赖！！
+ 然后coding
+ 要记得在package文件加上bin字段，value是对象，key是要在`terminal`运行的命令，key对应的对象是要执行的文件
+ ⚠️一定一定要记得在执行的文件的头部要加`#!/usr/bin/env node`(心塞，查了好久才找到)！！！
+ coding结束要用`npm link`本地调试一个，记住npm的repo不要定位到淘宝的去！！
+ 没有账号的记得注册，然后用npm login 登陆一下
+ npm publish，⚠️一定一定要记得改版本号！！如果publish的时候403了，maybe是你的包重名了，记得去npm上查一下你的包有没有跟别人的重了(踩坑踩的那叫一踩一个准hhh)
Done！