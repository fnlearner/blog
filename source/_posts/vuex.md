---
title: vuex
date: 2020-04-28 14:06:42
tags:
---

## vuex 简述

vuex 本质上就是 vue 中的 mixin，store 在每个 vue 组建实例创建的时候通过 mixin 的方式注入的，mixin 就类似这样的格式

```bash
const mixComponent = {
    data(){
        return {
            message:'hello',
            foo:'abc'
        }
    }
}
new Vue({
    mixins:[mixComponent],
    data(){
        return {
            message:'goodbye',
            bar:'def'
        }
    },
    created(){
        console.log(this.$data)
        # => {message:'goodbye',foo:'abc',bar:'def'}
    }
})
```

当组建和混入的 mixins 含有同名选项时，这些选项将会以适当的方式进行合并，比如 mixins 中的 data 和组建的 data 有同名属性时，那么将会以组建中的数据为准。当具有同名的钩子函数时，那么同名的钩子函数将会组成一个数组，它们都将被调用。另外，mixins 中的钩子函数将会在组件自身钩子之前调用。
值为对象的选项时，它们将会被合并为一个对象，k-v 冲突时，取组件中的 kv。
而 vuex 正是全局的 mixins，将会在每个组件 create 的时候注入
<!-- more -->
### [Vue.use](https://cn.vuejs.org/v2/api/#Vue-use)

可以看看官网对这个方法对介绍

- 参数：

  {Object | Function} plugin

- 用法：

  安装 Vue.js 插件。如果插件是一个对象，必须提供 install 方法。如果插件是一个函数，它会被作为 install 方法。install 方法调用时，会将 Vue 作为参数传入。

  该方法需要在调用 new Vue() 之前被调用。

  当 install 方法被同一个插件多次调用，插件将只会被安装一次。

- 参考：[插件](https://cn.vuejs.org/v2/guide/plugins.html)

然后看看源代码怎么实现的,在 vue 中，要想使用 vuex，那么肯定就要安装官方的 vuex 插件，然后在入口文件中调用 Vue.use(vuex)

```bash
function initUse (Vue) {
  Vue.use = function (plugin) {
    var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
    # 如果已经存在，则直接返回this也就是Vue
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    # additional parameters
    var args = toArray(arguments, 1);
    # 把 this（也就是Vue）作为数组的第一项
    args.unshift(this);
    # 如果插件的install属性是函数,调用它
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      # 如果插件是函数,则调用它
      # apply(null) 严格模式下 plugin 插件函数的 this 就是 null
      plugin.apply(null, args);
    }
    # 添加到已安装的插件
    installedPlugins.push(plugin);
    return this
  };
}
```

然后康康 install 函数做了什么

```bash
export function install(_Vue){
    # Vue存在并且相等，说明已经执行过install了，直接返回
    if(Vue && _Vue === Vue){
        //省略非生产环境报错代码
        return
    }
    Vue = _Vue
    applyMixin(Vue)
}
```

OK，继续看 applyMixin

```bash
export default function (Vue) {
  const version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    # 合并选项后 beforeCreate 是数组里函数的形式  [func,  func]
    # 最后调用循环遍历这个数组，调用这些函数，这是一种函数与函数合并的解决方案。
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
      //兼容vue 1.x的代码，不管它
    }
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    # console.log('vuexInit')
    const options = this.$options
    # 在调用vue.use装载vuex的时候，把这个方法注入到mixins中的beforeCreated中，因为同名钩子函数不会覆盖，会组成数组然后遍历执行
    # 这里的$options就是在初始化new Vuex.Store(options={})这个时候传进来的参数，这样混入之后每个组件都可以在this访问store对象
    if (options.store) {
      console.log('options.store')
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      console.log('options.parent.$store')
      this.$store = options.parent.$store
    }
  }
}

```

然后来看生成 Store 的构造函数

```bash
import applyMixin from './mixin'
import devtoolPlugin from './plugins/devtool'
import ModuleCollection from './module/module-collection'
import { forEachValue, isObject, isPromise, assert, partial } from './util'
let Vue
```

首先是引入文件，applyMixin 之前有说，然后是 devtoolPlugin，看名字猜应该是 vue-devtool 有关，pass，然后是一些封装的工具函数，看一下代码

```bash
# 条件断言，不满足条件抛出错误
export function assert (condition, msg) {
    if (!condition) throw new Error(`[vuex] ${msg}`)
}
# 返回一个新的函数
export function partial(fn,arg){
    return function(){
        return fn(arg)
    }
}
# 判断promise，但是这个判断方法是不严谨的，假设我现在有一个object => const obj ={then(){}},obj它是一个对象，它也拥有then方法，但是它其实不是一个promise
export function isPromise(val){
    return val && typeof val.then === 'function'
}
# 这个方法不仅仅用来判断是否是object，同时还有date，regexp，array
export function isObject(val){
    return obj!==null && typeof val === 'object'
}
# 统一成对象风格
function unifyObjectStyle (type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload
    payload = type
    type = type.type
  }

  # type不是字符串类型，非生产环境报错
  if (process.env.NODE_ENV !== 'production') {
    assert(typeof type === 'string', `expects string as the type, but found ${typeof type}.`)
  }

  return { type, payload, options }
}
```

可以看到，这个应该是以闭包的形式返回一个新函数
然后全局声明一个 Vue 变量，打一下断点我们可以发现 Vue 储存的其实是一个 function
然后看正文

```bash
export class Store {
  constructor (options = {}) {
    # Auto install if it is not done yet and `window` has `Vue`.
    # To allow users to avoid auto-installation in some cases,
    # this code should be placed here. See #731
    # 如果是 cdn script 引入vuex插件，则自动安装vuex插件，不需要用Vue.use(Vuex)来安装
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue)
    }

    if (process.env.NODE_ENV !== 'production') {
      # 必须使用Vue.use(Vuex) 创建 store 实例
      assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
      # 当前环境不支持Promise，报错：vuex需要Promise polyfill
      assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`)
      # Store 函数必须使用new操作符调用
      assert(this instanceof Store, `store must be called with the new operator.`)
    }

    const {
      # 插件默认是空数组
      plugins = [],
      # 严格模式默认是false
      strict = false
    } = options

    # store internal state
    # store 实例对象 内部的 state
    this._committing = false
    # 用来存放处理后的用户自定义的actoins
    # Object.create生成的实例是不会有原型链这种东西的
    this._actions = Object.create(null)
    # 用来存放 actions 订阅
    this._actionSubscribers = []
    # 用来存放处理后的用户自定义的mutations
    this._mutations = Object.create(null)
    # 用来存放处理后的用户自定义的 getters
    this._wrappedGetters = Object.create(null)
    # 模块收集器，构造模块树形结构
    this._modules = new ModuleCollection(options)
    /#用于存储模块命名空间的关系
    this._modulesNamespaceMap = Object.create(null)
    # 订阅
    this._subscribers = []
     # 用于使用 $watch 观测 getters
    this._watcherVM = new Vue()
     # 用来存放生成的本地 getters 的缓存
    this._makeLocalGettersCache = Object.create(null)

    #bind commit and dispatch to self
     # 给自己 绑定 commit 和 dispatch
    const store = this
    const { dispatch, commit } = this
    # 为何要这样绑定 ?
    # 说明调用commit和dispach 的 this 不一定是 store 实例
    # 这是确保这两个函数里的this是store实例
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    # strict mode
    this.strict = strict

    # 根模块的state
    const state = this._modules.root.state

    # init root module.
    # this also recursively registers all sub-modules
    # and collects all module getters inside this._wrappedGetters
    # 初始化 根模块
    # 并且也递归的注册所有子模块
    # 并且收集所有模块的 getters 放在 this._wrappedGetters 里面
    installModule(this, state, [], this._modules.root)

    # initialize the store vm, which is responsible for the reactivity
    # (also registers _wrappedGetters as computed properties)
    # 初始化 store._vm 响应式的
    # 并且注册 _wrappedGetters 作为 computed 的属性
    resetStoreVM(this, state)

    # apply plugins
    # 把实例store传给插件函数，执行所有插件
    plugins.forEach(plugin => plugin(this))

    # 初始化 vue-devtool 开发工具
    # 参数 devtools 传递了取 devtools 否则取Vue.config.devtools 配置
    const useDevtools = options.devtools !== undefined ? options.devtools : Vue.config.devtools
    if (useDevtools) {
      devtoolPlugin(this)
    }
    # 省略方法
    # Vue.Store本地commit dispatch
    commit(_type,_payload,_options){
        #代码跟之前注册的时候类似
        const {
            type,
            payload,
            options
        } = unifyObjectStyle(_type, _payload, _options)

        const mutation = { type, payload }
        # 取出处理后的用户定义 mutation
        const entry = this._mutations[type]
        if (!entry) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(`[vuex] unknown mutation type: ${type}`)
            }
            return
        }
        this._withCommit(() => {
            entry.forEach(function commitIterator (handler) {
                # 这里会跳到之前注册时的函数所绑定的新函数格式
                handler(payload)
            })
        })
        this._subscribers.forEach(sub => sub(mutation, this.state))

        if (
            process.env.NODE_ENV !== 'production' &&
            options && options.silent
        ) {
            console.warn(
                `[vuex] mutation type: ${type}. Silent option has been removed. ` +
                'Use the filter functionality in the vue-devtools'
            )
        }
    }，
    dispatch (_type, _payload) {
        # check object-style dispatch
        # 获取到type和payload参数
        const {
            type,
            payload
        } = unifyObjectStyle(_type, _payload)

        # 声明 action 变量 等于 type和payload参数
        const action = { type, payload }
        # 入口，也就是 _actions 集合
        const entry = this._actions[type]
        # 如果不存在
        if (!entry) {
            # 非生产环境报错，匹配不到 action 类型
            if (process.env.NODE_ENV !== 'production') {
                console.error(`[vuex] unknown action type: ${type}`)
            }
            # 不往下执行
            return
        }

        try {
            this._actionSubscribers
                .filter(sub => sub.before)
                .forEach(sub => sub.before(action, this.state))
        } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`[vuex] error in before action subscribers: `)
                console.error(e)
            }
        }

        const result = entry.length > 1
        ? Promise.all(entry.map(handler => handler(payload)))
        : entry[0](payload)

        return result.then(res => {
            try {
                this._actionSubscribers
                .filter(sub => sub.after)
                .forEach(sub => sub.after(action, this.state))
            } catch (e) {
                if (process.env.NODE_ENV !== 'production') {
                console.warn(`[vuex] error in after action subscribers: `)
                console.error(e)
                }
            }
            return res
        })
    }
  }
}
```

OK,康康 installModule 怎么执行的

```bash
#
# 注册在命名空间的map对象中。
# 模块命名控件为 true 执行以下代码
# 主要用于在 helpers 辅助函数，根据命名空间获取模块
#
#
function getModuleByNamespace (store, helper, namespace) {
      # _modulesNamespaceMap 这个变量在 class Store 中
      const module = store._modulesNamespaceMap[namespace]
      if (process.env.NODE_ENV !== 'production' && !module) {
        console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`)
      }
      return module
}
```

```bash
# 获取命名空间
function getNamespace (path) {
      let module = this.root；
      return path.reduce((namespace, key) => {
        module = module.getChild(key)
        return namespace + (module.namespaced ? key + '/' : '')
      }, '')
}
# 根据路径来获取嵌套的state
function getNestedState(state,path){
    return path.length ? path.reduce((state,key)=>state[key],state):state
}
function installModule (store, rootState, path, module, hot) {
  # 是根模块
  const isRoot = !path.length
  # 获取命名空间
  const namespace = store._modules.getNamespace(path)

  # register in namespace map
  if (module.namespaced) {
    # 模块命名空间map对象中已经有了，开发环境报错提示重复
    if (store._modulesNamespaceMap[namespace] && process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] duplicate namespace ${namespace} for the namespaced module ${path.join('/')}`)
    }
    # module 赋值给 _modulesNamespaceMap[namespace]
    store._modulesNamespaceMap[namespace] = module
  }

  # set state
  # 不是根模块且不是热重载
  if (!isRoot && !hot) {
    # 获取父级的state
    const parentState = getNestedState(rootState, path.slice(0, -1))
    # 模块名称
    # 比如 cart
    const moduleName = path[path.length - 1]
    # state 注册
    store._withCommit(() => {
      if (process.env.NODE_ENV !== 'production') {
        if (moduleName in parentState) {
          console.warn(
            `[vuex] state field "${moduleName}" was overridden by a module with the same name at "${path.join('.')}"`
          )
        }
      }
        #
        # 最后得到的是类似这样的结构且是响应式的数据 比如
        #
        # Store实例：{
        # 省略若干属性和方法
        # 这里的state是只读属性 可搜索 get state 查看
        # state: {
        #   cart: {
        #     checkoutStatus: null,
        #     items: []
        #    }
        #   }
        # }
        #
        #

      Vue.set(parentState, moduleName, module.state)
    })
  }

  # module.context  这个赋值主要是给 helpers 中 mapState、mapGetters、mapMutations、mapActions四个辅助函数使用的。
  # 生成本地的dispatch、commit、getters和state
  #  主要作用就是抹平差异化，不需要用户再传模块参数
  const local = module.context = makeLocalContext(store, namespace, path)

  # 循环遍历注册mutation
  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  # 循环遍历注册 action
  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })

  # 循环遍历注册 getter
  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  /**
   * 注册子模块
   * forEachChild (fn) {
        forEachValue(this._children, fn)
      }
   */
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
```

```bash
function makeLocalContext(store,namespace,path){
    # 判断是否有命名空间生成
    const noNamespace = namespace === ''
    # 如果没有命名空间。那么就直接用store的dispatch
    const local = {
        dispatch: noNamespace ?store.dispatch :(_type,_payload,_options)=>{
            # 这步是为了抹平差异化，因为调用方式可以是 dispatch(type,payload)，也可以是dispatch({type,payload,options}),所以这里需要做一个函数来形成统一的风格
            const args = unifyObjectstyle(_type,_payload,_options)

            const {payload,options} = args

            let {type} = args

            if(!options|| options.root){
                type = namespace + type
                if(’生产环境‘){
                    # 省略非生产环境报错代码
                    return
                }
            }
            return store.dispatch(type,payload)
        },
        commit:noNamespace?store.commit:(_type,_payload,_options)=>{
            const args = unifyObjectstyle(_type,_payload,_options)

            const {payload,options} = args

            let {type} = args
            if(!options|| options.root){
                type = namespace + type
                if(’生产环境‘){
                    # 省略非生产环境报错代码
                    return
                }
            }
            return store.commit(type,payload,options)
        }
    }
    # getters  和 states 必须是懒加载 ，因为 它们会被实例的update修改
    Object.defineProperties(local, {
        getters: {
        # 没有命名空间，直接取值 store.getters
        get: noNamespace
            ? () => store.getters
            # 否则
            : () => makeLocalGetters(store, namespace)
        },
        state: {
            get: () => getNestedState(store.state, path)
        }
    })

  return local
}
```

makeLocalGetters

```bash
function makeLocalGetters (store, namespace) {
  # _makeLocalGettersCache 缓存是vuex v3.1.2中 加的
  # 如果不存在getters本地缓存中不存在，才执行下面的代码
  # 如果存在直接返回
  # return store._makeLocalGettersCache[namespace]
  if (!store._makeLocalGettersCache[namespace]) {
    # 声明 gettersProxy对象
    const gettersProxy = {}
    # 命名空间 长度
    const splitPos = namespace.length
    Object.keys(store.getters).forEach(type => {
      # skip if the target getter is not match this namespace
      # 如果目标getters没有匹配到命名空间直接跳过
      if (type.slice(0, splitPos) !== namespace) return

      # extract local getter type
      # 提取本地type
      const localType = type.slice(splitPos)

      # Add a port to the getters proxy.
      # Define as getter property because
      # we do not want to evaluate the getters in this time.
      # 添加一个代理
      # 定义getters 属性
      # 因为我们现在不想计算getters
      Object.defineProperty(gettersProxy, localType, {
        get: () => store.getters[type],
        # 可以枚举
        enumerable: true
      })
    })
    # 赋值
    store._makeLocalGettersCache[namespace] = gettersProxy
  }

  # 如果存在直接返回
  return store._makeLocalGettersCache[namespace]
}
```

注册 mutations

```bash
function registerMutation (store, type, handler, local) {
  # 收集的所有的mutations找对应的mutation函数，没有就赋值空数组
  const entry = store._mutations[type] || (store._mutations[type] = [])
  # 最后 mutation
  entry.push(function wrappedMutationHandler (payload) {
    # 所以这就是为什么当我们调用mutation函数的时候仅需要传递一个参数，而函数体的参数列表的第一个参数却不是我们所传递的参数，而是state的原因
    handler.call(store, local.state, payload)
  })
}

```

注册 action

```bash
function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = [])
  /# payload 是actions函数的第二个参数
  entry.push(function wrappedActionHandler (payload) {
      # 所以这就是为什么调用action的时候第一个参数不是state，而不是store对象
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload)
    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }
    # devtool 工具触发 vuex:error
    if (store._devtoolHook) {
      # catch 捕获错误
      return res.catch(err => {
        store._devtoolHook.emit('vuex:error', err)
        # 抛出错误
        throw err
      })
    } else {
      # 然后函数执行结果
      return res
    }
  })
}
```

注册 getters

```bash
# 注解略，都差不多逻辑
function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] duplicate getter key: ${type}`)
    }
    return
  }
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, # local state
      local.getters, # local getters
      store.state, # root state
      store.getters # root getters
    )
  }
}
```

resetStoreVM

```bash
# 这个方法让store变成一个响应式的vue实例
function resetStoreVM (store, state, hot) {

  # 存储一份老的Vue实例对象 _vm
  const oldVm = store._vm

  # bind store public getters
  # 绑定 store.getter
  store.getters = {}
  # reset local getters cache
  # 重置 本地getters的缓存
  store._makeLocalGettersCache = Object.create(null)
  # 注册时收集的处理后的用户自定义的 wrappedGetters
  const wrappedGetters = store._wrappedGetters
  # 声明 计算属性 computed 对象
  const computed = {}
  # 遍历 wrappedGetters 赋值到 computed 上
  forEachValue(wrappedGetters, (fn, key) => {
    # use computed to leverage its lazy-caching mechanism
    # direct inline function use will lead to closure preserving oldVm.
    # using partial to return function with only arguments preserved in closure environment.
    computed[key] = partial(fn, store)
    # getter 赋值 keys
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true
    })
  })

  # use a Vue instance to store the state tree
  # suppress warnings just in case the user has added
  # some funky global mixins
  # 使用一个 Vue 实例对象存储 state 树
  # 阻止警告 用户添加的一些全局mixins

  # 声明变量 silent 存储用户设置的静默模式配置
  const silent = Vue.config.silent
  # 静默模式开启
  Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  # 把存储的静默模式配置赋值回来
  Vue.config.silent = silent

  # enable strict mode for new vm
  # 开启严格模式 执行这句
  # 用$watch 观测 state，只能使用 mutation 修改 也就是 _withCommit 函数
  if (store.strict) {
    enableStrictMode(store)
  }

  # 如果存在老的 _vm 实例
  if (oldVm) {
    # 热加载为 true
    if (hot) {
      #dispatch changes in all subscribed watchers
      #to force getter re-evaluation for hot reloading.
      #设置  oldVm._data.$$state = null
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    # 实例销毁
    Vue.nextTick(() => oldVm.$destroy())
  }
}
```

## 辅助函数

### mapState

```bash
export const mapState = normalizeNamespace((namespace, states) => {
  const res = {}
  # 非生产环境 判断参数 states  必须是数组或者是对象
  if (process.env.NODE_ENV !== 'production' && !isValidMap(states)) {
    console.error('[vuex] mapState: mapper parameter must be either an Array or an Object')
  }
   # normalizeMap 最终都是返回数组 [ { key, val } ] 形式
   # normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
   # normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]

  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
      let state = this.$store.state
      let getters = this.$store.getters
      # 传了参数 namespace
      if (namespace) {
        # 用 namespace 从 store 中找一个模块。
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        state = module.context.state
        getters = module.context.getters
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
    # 标记为 vuex 方便在 devtools 显示
    # mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})
```
看了下剩下的几个map，逻辑都一样，就是return都时候做下修改就好，那就这样啦
Done！


------- 更新 2020.6.26
害 ，发现vuex更新到vuex4了，然后我看了一下，有个东西改了，人家不用mixin来注入store这东西了哈，人家用provide和inject来注入store了
[代码](https://github.com/vuejs/vuex/blob/4.0/src/store.js)
#### 看下简单的示例代码
```bash
import { createApp } from 'vue'
import Counter from './Counter.vue'
import store from './store'

const app = createApp(Counter)
console.log('app is created')
app.use(store)
console.log('store is used')
app.mount('#app')
```
在调用app.use方法的时候用调用注入plugin的install方法
（如果install方法存在的话），看下use方法怎么写的
```bash
       use(plugin, ...options) {
                if (installedPlugins.has(plugin)) {
                    (process.env.NODE_ENV !== 'production') && warn(`Plugin has already been applied to target app.`);
                }
                else if (plugin && isFunction(plugin.install)) {
                    installedPlugins.add(plugin);
                    plugin.install(app, ...options);
                }
                else if (isFunction(plugin)) {
                    installedPlugins.add(plugin);
                    plugin(app, ...options);
                }
                else if ((process.env.NODE_ENV !== 'production')) {
                    warn(`A plugin must either be a function or an object with an "install" ` +
                        `function.`);
                }
                return app;
            },
```
然后看下vuex中的install方法怎么写的
```bash
install (app, injectKey) {
    app.provide(injectKey || storeKey, this)
    app.config.globalProperties.$store = this
}
```
很明显得看出是把store放到provide中实行了，并且因为在调用的时候是用的`plugin.install(app)`的方法来写的，所以这个时候的this指向的是store实例，这样就可以把store实例注入到app实例中了 ，这样写的好处我觉得就是数据来源更清晰了吧。
