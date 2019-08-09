---
title: 基于Hexo搭建个人博客
date: 2019-08-05 14:48:50
tags: hexo blog
categories: tool
---

## 准备工作

1. 安装Node
2. 安装hexo-cli
3. 确保有github账号
4. 安装git

<!-- more -->
## 构建hexo项目
###  初始化hexo项目,项目名一定要用这个格式，xxx代表的是你的GitHub账号的名称
`hexo init xxx.github.io`
###  进入文件夹
`cd xxx.github.io`
###  安装依赖
`npm i `
###  运行项目
`hexo server`
###  搭建新的post,新搭建的post支持markdown语法，只要专注写文就OK
`hexo new post_name`


## 生成静态文件并部署
### 配置根目录下的_config.yml文件
  ①url是你要部署的地址(github地址或者自己的网站地址，如果不是部署在根目录下，url填写为具体部署的文件夹路径，root为/fileName/),fileName为具体的要部署的文件夹名称
  ②配置deploy参数，type为git，repo为仓库地址，ssh和https均可以，branch为要部署的分支
### 安装依赖包
`npm install hexo-deployer-git --save`
### 清除缓存文件
`hexo clean`
### 生成静态文件
`hexo generate`
可以简写为
```
hexo g
```

### 部署到服务器上
`hexo deploy`
可以简写为
```
hexo d
```

### 更换主题
  我选择的是next，拥有丰富而简单的配置，结合第三方服务，打造属于您自己的博客,在hexo根目录运行以下命令，会在themes文件夹下生成一个next的子模块
  ```
  $ git submodule add https://github.com/iissnan/hexo-theme-next themes/next
  ```
  在根目录下的_config.yml配置theme：next主题就可以生效了(关于更多submodule用法自行google)



## 访问
 部署完成后就可以直接访问了，在浏览器输入栏中输入xxx.github.io即可（xxx为你的GitHub账号名称）

## 注意
  1. 记得把你的代码push到你的remote repo上，不然只能在一台电脑做开发啦
  2. 另外，由于在当前仓库下有子模块存在，因此当你在另外一台电脑clone你的项目的时候，子模块是不会自动更新的,所以请运行以下命令来更新子模块，否则项目不完整
  ```
    git submodule update --init --recursive
  ```