// const proxy = require("http-proxy-middleware")
// const { Object } = require("core-js")

//  对象的响应式
function defineReactive(obj, key, val) {
  // 递归
  observe(val)

  // 对传入 obj 进行访问拦截
  Object.defineProperty(obj, key, {
    get() {
      console.log('get' + key, val)
      return val
    },
    set(newVal) {
      if(newVal !== val) {
        // 如果传进来的 newVal 依然是 obj, 需要做一下响应化处理
        observe(newVal)
        val = newVal
      }
    }
  })
}

function observe(obj) {
  if(typeof obj !== 'object' || obj == null) {
    // 希望传入的是obj
    return obj
  }
  
  // 创建 Observer 实例
  new Observer(obj)
}

// 代理函数， 方便用户直接访问 $data 中的数据
function proxy(vm, sourceKey) {
  // vm[sourceKey] 就是vm[$data]
  Object.keys(vm[sourceKey]).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        return vm[sourceKey][key]
      },
      set(newVal) {
        vm[sourceKey][key] = newVal
      }
    })
  })
}

// 创建 kvue 的构造函数
class kVue {
  constructor(options) {
    // 保存选项
    this.$options = options
    this.$data = options.data

    // 响应化处理
    observe(this.$data)

    // 代理
    proxy(this, '$data')
  }
}

// 更新对象的类型如何做响应化
class Observer {
  constructor(value) {
    this.value = value

    // 判断其类型
    if(typeof value === 'object') {
      this.walk(value)
    }
  }
  // 对象数据的响应化
  walk(obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key])
    })
  }

  // 数组数据的响应化
}