// 响应式
// const obj = {}
// 数组的响应式
// 1.替换数组原型中的那 7 个方法
const orginaProto = Array.prototype;
// 备份一份，修改备份(被覆盖的对象)
const arrayProto = Object.create(orginaProto);
['push','pop','shift','unshift','reverse','splice','sort'].forEach(method => {

  arrayProto[method] = function() {
    // 原始操作
    orginaProto[method].apply(this, arguments)
    // 覆盖操作，通知更新
    console.log('数组执行' + method + '操作');
  }
})


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
        console.log('set' + newVal)
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
  
  // 判断传入 obj 的类型
  if(Array.isArray(obj)) {
    // 覆盖原型替换我们 7 个变更操作
    obj.__proto__ = arrayProto
    // 对数组内部的元素进行响应化
    const keys = Object.keys(obj)
    for(let i = 0; i < obj.length; i++) {
      observe(obj[i])
    }
  }else {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key])
    })
  }
  
}

function set(obj, key, val) {
  defineReactive(obj, key, val)
}
// obj.foo  // 执行
// obj.foo = 'fooooooooooooooooo'  // 写入

const obj = {
  foo: 'foo',
  bar: 'bar',
  baz: {
    a: 1
  },
  arr: [1, 2, 3]
}

// 遍历响应化处理
observe(obj)

// obj.foo
// obj.foo = 'foooooooooooo'
// obj.bar
// obj.bar = 'barrrrrrrrrrrr'


// obj.baz = {a: 100}
// obj.baz.a = 100000


// set(obj, 'dong', 'dong')
// obj.dong

// Object.defineProperty() 对数组是无效的
// 改变数组的方法只有 7 个, 进行更新覆盖
// 替换数组实例的原型方法，让他们在修改数组的同时还能更新
obj.arr.push(4)