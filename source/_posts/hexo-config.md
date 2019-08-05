---
title: hexo_config
date: 2019-08-05 14:48:50
tags:
---

## 基于Hexo搭建个人博客

### 准备工作

1. 安装Node
2. 安装hexo-cli
`npm i -g hexo-cli`
3. 确保有github账号

### 构建hexo项目

##### 初始化hexo项目,项目名一定要用这个格式，xxx代表的是你的GitHub账号的名称
`hexo init xxx.github.io`

##### 进入文件夹
`cd xxx.github.io`

##### 安装依赖
`npm i `

##### 运行项目
`hexo server`

这样一套命令下来就可以运行hexo搭建的项目了

##### 搭建新的post,新搭建的post支持markdown语法，只要专注写文就OK
`hexo new post_name`


### 生成静态文件并且部署到相应的地址去

##### 配置根目录下的_config.yml文件

1. url是你要部署的地址(github地址或者自己的网站地址，如果不是部署在根目录下，url填写为具体部署的文件夹路径，root为/fileName/),fileName为具体的要部署的文件夹名称
2. 配置deploy参数，type为git，repo为仓库地址，ssh和https均可以，branch为要部署的分支

##### 安装依赖包
`npm install hexo-deployer-git --save`

##### 清除缓存文件
`hexo clean`

##### 生成静态文件，可以简写为hexo g
`hexo generate`

##### 部署到服务器上,可以简写为hexo d
`hexo deploy`


### 访问

部署完成后就可以直接访问了，在浏览器输入栏中输入xxx.github.io即可（xxx为你的GitHub账号名称）








