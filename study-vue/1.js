function defineReactive(obj, key, val) {
  observe(val)
  Object.defineProperty(obj, key, {
    get() {
      console.log('get', key);
      return val
    },
    set(newVal) {
      if (val !== newVal) {
        // 如果newVal是对象，也要做响应式处理
        observe(newVal)
        val = newVal
        console.log('set', key, newVal);

      }
    }
  })
}

function observe(obj){
  if(typeof obj !== 'object' || obj == null) {
    return obj
  }
  
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}


function set(obj, key, val) {
  defineReactive(obj, key, val)
}

const obj = { foo: 'foo', bar: 'bar', baz: { a: 1 } }

// 遍历响应化处理
observe(obj)

set(obj, 'dong', 'dong')
obj.dong = 'dongdong'