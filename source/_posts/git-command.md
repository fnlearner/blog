---
title: git常用命令集合
date: 2019-08-05 14:08:26
tags: git 
categories: tool
---


##### 查看当前工作区状态
`git status `

##### 提交当前工作区文件到暂存区
`git add`

##### 提交暂存区的修改到当前分支
`git commit `

<!-- more -->
##### 把当前分支提交的修改推送到远程仓库去
`git push origin master`

##### 查看仓库提交记录
`git log`

##### 回退提交记录和工作区
`git reset --hard <commitid>`

##### 回退提交记录
`git reset --soft <commitid>`

##### 保存当前尚未添加到暂存区以及尚未提交到本地分支的代码(一般用于当修改文件的时候突然想要拉取远程仓库代码的尴尬情况)，stash是本地的，当push pull的时候不会把statsh的代码传输到远程仓库去
`git stash`

##### 在工作区显示刚刚在statsh保存的代码以及文件
`git stash apply`

##### 查看保存在stash的记录
`git stash list`

##### 撤销某一个操作，并且把当前撤销操作当成一次新的commit提交
`git revert HEAD|<commitid>`

##### 删除远程分支
`git push origin --delete <branchName>`

##### 删除本地分支
`git branch -d|-D <branchName>`

##### 查看本地分支
`git branch`

##### 查看远程分支
`git branch -a`

##### 切换分支（如果本地要新建并且切换一个新的分支，要新加上-b参数，查看分支不需要加-b参数）
`git checkout （-b） <branchName>`


##### 删除文件
`git rm <fileName>`


##### 删除文件夹
`git rm -r <fileName>`


##### 下载指定仓库(这个就不用多说了)
`git clone <repoUrl>`


##### 添加子模块到当前仓库中
`git submodule add <repo url>`

##### clone带有子模块的仓库时需要更新子模块
`git submodule update --init --recursive`


##### 初始化本地仓库
`git init`

##### 添加远程仓库
`git remote add [option_name] [repo_url]`

##### 从远程仓库拉取文件
`git pull origin master`
`git pull origin master --allow-unrelated-histories`

##### 查看远程仓库地址
`git remote -v`

<html>

<head>
    <style>
        .weather {
            width: 100%;
            height: 500px;
            /* background: #212125; */
            display: flex;
            justify-content: flex-start;
            align-content: center;
            color: #e6e8db;
        }
        .cloudy {
            position: relative;
            width: 300px;
            height: 300px;
            border-radius: 100%;
            background: linear-gradient(to top right, #1b9ce2 0, #e0e2e5 90%);
            box-shadow: 0 0 0 10px currentColor inset, 0 0 100px -10px;
        }
        .cloud {
            position: absolute;
            top: 25%;
            left: 40%;
            width: 100px;
            height: 30px;
            border-radius: 20px;
            background-color: #fff;
            box-shadow: 0 0 20px 10px currentColor inset, 0 0 100px -10px #c9e8de;
            animation: move 4000ms infinite ease-in-out;
        }
        .cloud::after {
            left: 45px;
            height: 35px;
            width: 35px;
        }
        .cloud::before {
            left: 15px;
            height: 50px;
            width: 50px;
        }
        .cloud::before,
        .cloud::after {
            content: '';
            position: inherit;
            border-radius: 100%;
            background-color: inherit;
            box-shadow: inherit;
            bottom: 40%;
        }
        @keyframes move {
            50% {
                transform: translateX(-10px);
            }
        }
    </style>
</head>

<body>
    <div class="weather">
        <div class="cloudy">
            <span class="cloud"></span>
        </div>
    </div>

</body>

</html>