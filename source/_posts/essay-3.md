---
title: docker
date: 2020-07-31 12:30:10
tags:
---

## 介绍

Docker 是由开发人员和系统管理员 构建 、运行和容器共享的应用程序的一个平台。使用容器部署应用程序称之为集装箱化。

## 特点

docker 为什么能够越来越受欢迎，那是因为:

1. 灵活性：即使再复杂的应用也能够被容器化。
2. 轻量性：容器共享主机内核，并且在系统资源利用方面比虚拟机更加的高效
3. 便携性：你可以在本地将应用打包成镜像，然后上传到云端，然后就可以在任何地方运行这个镜像
4. 解耦：容器拥有高度自治权以及封闭性，你可以在不干扰其他应用程序的情况下对其中一个进行升级或者替换
5. 拓展性：可以在数据中心自动分发容器副本
6. 容器对应用隔离，对用户来说完全是黑盒，不用关心容器内发配置
<!-- more -->
## 解决了哪些问题

1. 有时候在测试环境程序运行正常，但是在生产环境却出现了问题。`docker`的出现让测试环境和生产环境保持了一致性。
2. 对于每个新用户来说，在执行程序之前必须在本机环境安装对应的环境。`docker`保证了一次配置，一键部署
3. 由于版本问题导致程序不能正常启动.`docker`保证在部署的时候安装的版本跟开发时候的版本是完全一致的，重新定义了交付环境,比如对于`node-sass`的安装，不同版本的`node-sass`要对应不同版本的`node`，否则在安装的时候就会出现错误，需要重新 rebuild

## 微服务

docker 常常与 微服务架构 一起使用
这是一个简单的单机架构，当需求简单时，可以采用单机架构进行开发
![简单需求](/images/essay-3/esay.jpg)

但是当需求开始复杂时，如果还用单机架构进行开发

![复杂需求](/images/essay-3/complex.jpg)

这样的设计是不太合理的

1. 对于网站和移动端来说，有很多相同逻辑的业务代码
2. 数据有时候通过数据库共享，有时候通过调用接口传输。接口调用关系混乱。
3. 单个应用为了给其他应用提供不同的结构，逐渐越改越大，越来越多的 ifelse，功能归属混乱
4. 数据库为多个应用提供数据支持，难以重构和优化
5. 所有应用都在同一个数据库进行操作，当数据量庞大时，容易出现性能瓶颈，需要分库分表
6. 部署、维护、开发困难，即使只改动一个功能，也需要整体应用一起发布。如果不小心带上未经测试的代码，也有可能出现意料之外的错误

将服务进行拆分，让每个容器能够各司其职，只负责一小部分模块，然后将各个服务进行拼接起来就组成一个完整的服务，并且在更新代码时也只需要更新其中一个容器而不用对整个应用进行更新
![micro_service](/images/essay-3/micro_service.jpg)

## 镜像和容器

从根本上来说，容器只是一个正在运行的进程，应用了一些添加的封装特性以便它能和主机以及其他容器分离开。对于容器隔离最重要的概念之一就是每个容器和它自身的文件系统交互。文件系统是由`docker image`来提供的。一个`image`包含了一切运行所需的东西-- 代码或者二进制，运行依赖以及其他任何文件系统对象。

## 容器连接

`docker`实例之间虽然都是互相隔离的，但是隔离的只是它们的环境，但是它们容器之前也需要互相联系，数据之间的传递，不然做拆分就没有任何的意义，用--link 来做容器之间的连接。同时在创建容器时需要设定好宿主机和容器之间的端口映射，这样可以通过访问宿主机的端口来访问容器的服务。
对于容器来说，如果把一些数据存放在容器中，那么当容器被删除时，那么存放在容器中的数据也会被删除，这是不合理的，所以数据应该放在宿主机中，然后映射进容器中，这样当容器被删除时，数据仍然存在于宿主机中

## DockerFile

想要把应用编写成一个 docker 镜像，需要编写 DokcerFile 文件

这是一个 dockerFile 文件例子

```bash
FROM php:7.4.8-fpm
MAINTAINER liubucai
ENV REDIS_VERSION=5.3.1
ENV SWOOLE_VERSION=4.4.16
ENV PROTOBUF_VERSION=0.12.3
ENV PSR_VERSION=1.0.0

RUN mv /etc/apt/sources.list /etc/apt/sources.list.bak \
&& echo "deb http://mirrors.163.com/debian/ jessie main non-free contri
b" >> /etc/apt/sources.list \
&& echo "deb-src http://mirrors.163.com/debian/ jessie main non-free co
ntrib" >>/etc/apt/sources.list \
# \
&& apt-get update && apt-get upgrade \
&& printf "%s %s %s %s %s\n" Yes, do as I say! | apt-get install libtin
fo5=5.9+20140913-1+deb8u3 \
&& apt-get install -y libncurses5 procps \
&& printf "%s %s %s %s %s\n" Yes, do as I say! | apt-get install zlib1g
=1:1.2.8.dfsg-2+b1 \
&& apt-get install -y libssl-dev libzip-dev wget zip vim \
# \
&& docker-php-source extract \
&& docker-php-ext-install bcmath sockets pdo_mysql pcntl opcache \
# \
&& wget https://github.com/allegro/php-protobuf/archive/master.zip \
&& unzip master.zip && rm -rf master.zip \
&& mv php-protobuf-master /usr/src/php/ext/ \
&& docker-php-ext-install php-protobuf-master \
&& curl -sS https://getcomposer.org/installer | php \
&& mv composer.phar /usr/local/bin/composer \
&& cd /usr/src/php/ext/php-protobuf-master/ && composer install \
&& wget https://github.com/protocolbuffers/protobuf/releases/download/v
3.12.3/protobuf-php-3.12.3.zip \
&& unzip protobuf-php-3.12.3.zip \
&& cd protobuf-3.12.3/ \
&& ./configure --prefix=/usr/local/protobuf \
&& make && make install \
&& export PATH=/usr/local/protobuf/bin:$PATH \
&& apt-get -y install npm \
&& npm install -g require && npm install -g browserify && npm install g
oogle-protobuf \
# \
&& pecl install redis-${REDIS_VERSION} && docker-php-ext-enable redis \
&& echo "install redis ok !" \
# \
&& printf "yes\n yes\n yes\n yes\n" | pecl install swoole-${SWOOLE_VE
RSION} \
&& docker-php-ext-enable swoole \
&& echo "install swoole ok !" \
# \
&& pecl install psr-${PSR_VERSION} && docker-php-ext-enable psr \
&& echo "install psr ok !" \
# \
&& pecl install zip && docker-php-ext-enable zip
#VOLUME ["/var/log","/usr/local/etc/","/var/run","/var/www/html"]
WORKDIR /var/www/html

EXPOSE 9000
#CMD php-fpm -R -D && tail -f /dev/null

```

## docker compose

当宿主机中拥有几十个 docker 服务时，如果一个一个的执行`docker run` 无疑是很让人崩溃的以及怀疑世界 ing，因此可以采用 docker compose 才对 docker 实例进行管理，只要写好 docker compose 的配置文件, 然后执行 `docker compose start` 那么就会执行配置文件中的 docker 实例（假设宿主机中已经启动对应的容器）

```bash
version: '3'
networks:
    xxx-game-net:
        driver: bridge # 以网桥的形式连接docker
services:
    nginx:
        image: nginx:latest # 安装的版本
        container_name: nginx-xxx
        restart: always
        ports:
            - 6688:80
        volumes: # 映射配置文件到容器中
            - ./conf/nginx/conf.d/:/etc/nginx/conf.d
            - ../html:/usr/share/nginx/html
            - ./log/nginx:/var/log/nginx
        depends_on: # 启动的依赖
            - mysql
            - redis
            - php-fpm
        networks:
            - xxx-game-net
 mysql:
    image: mysql:latest
    container_name: mysql-xxx
    command: --default-authentication-plugin=mysql_native_password
    restart: always
    ports:
        - 6666:3306
    volumes:
        - ./conf/mysql/conf.d/:/etc/mysql/conf.d
        - ./data/mysql:/var/lib/mysql
    environment:
        MYSQL_ROOT_PASSWORD: 123456
    networks:
        - xxx-game-net
php-fpm:
    build: .
    container_name: php-fpm-xxx
    volumes:
        - ../:/data/www
    networks:
        - xxx-game-net
redis:
    image: redis:latest
    container_name: redis-xxx
    restart: always
    ports:
        - 6668:6379
    volumes:
        - ./data/redis:/data
    networks:
        - xxx-game-net
```

-----OVER