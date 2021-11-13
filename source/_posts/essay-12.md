---
title: 今日随笔
date: 2021-11-13 20:18:44
tags: 
    - JavaScript
    - Tinymce
---

#### tinymce爬坑记录
</br>
若是需要使用tinymce并且要让tinymce的样式不受其他样式干扰时，vue中的使用scope给html标签增加自定义属性是不太可取的。应该是要使用shadow dom（与主dom分开渲染）或者iframe内嵌（可以理解为单独开一个窗体）

##### Note

1. 非inline模式下的tinymce是可以挂载在shadow dom下的，而inline模式下的tinymce挂载在shadow dom下是无效的，大致原因是浏览器的api selection对于shadow dom的支持还没搞定，具体可以查看tinymce的issue或者selection api的介绍，或者可以查看源代码16100+行左右的applyFormat函数，挂载在shadow dom中和不挂载在shadow dom中走的逻辑是不一样的！。（查了很久orz，然后去issue验证了猜想）
2. 初始化挂载在iframe下的tinymce需要使用当前document挂载的tinymce实例，使用父级窗体加载进来的tinymce在子iframe中是用不了的，因为tinymce在操作格式时会获取当前document下的数据。
3. 如果想要在toolbar添加自定义按钮可以使用ui.addButton.因为看见有人是通过直接操作dom的方式来添加自定义按钮
4. 如果要修改某个类的样式可以在content_style中进行修改，同样看见有人通过获取editor的容器然后遍历子节点来动态修改样式。
5. 假如iframe所在的vue组件加载成功了而加载了tinymce文件的iframe的window没有挂载tinymce时，这时候去初始化inline模式是初始化失败的，用vue的watch貌似是不起作用的，我用的方案是raf来定时获取tinymce，然后初始化数据。（假如有更好的方法告诉我。）