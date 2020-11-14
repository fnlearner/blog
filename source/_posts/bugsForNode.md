---
title: 部署hexo踩坑记录
date: 2020-11-14 22:47:51
tags:
---
在执行下面这句代码的时候
```bash
hexo clean && hexo g -d
```
报错信息
```bash
Something's wrong. Maybe you can find the solution here: https://hexo.io/docs/troubleshooting.html
TypeError [ERR_INVALID_ARG_TYPE]: The "mode" argument must be integer. Received an instance of Object
    at copyFile (fs.js:1924:10)
    at tryCatcher (/Users/zjs/Desktop/blog/node_modules/bluebird/js/release/util.js:16:23)
    at ret (eval at makeNodePromisifiedEval (/Users/zjs/.nvm/versions/node/v14.10.0/lib/node_modules/hexo-cli/node_modules/bluebird/js/release/promisify.js:184:12), <anonymous>:13:39)
```

解决方案
 NodeJs 版本从 14 回到 12 就🉑️！