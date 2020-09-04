// 编译器
// 递归遍历 dom
// 判断节点类型，如果是文本，则判断是否是插值绑定
// 如果是元素，则遍历其属性判断是否是指令或事件，然后递归子元素
class Compiler {
  // el 是宿主元素
  // vm 是KVue 实例
  constructor(el, vm) {
    // 保存kvue 的实例方便拿值
    this.$vm = vm
    this.$el = document.querySelector(el)

    // 解析模板
    if(this.$el) {
      // 编译
      this.compile(this.$el)
    }
  }

  compile(el) {
    // 遍历 el 树 
    const childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      // 判断是否是元素
      if(this.isElement(node)){
        // console.log('元素编译', node.nodeName);
        this.compileElement(node)
      }else if(this.isInter(node)){
        // console.log('编译插值绑定', node.textContent);
        this.compileText(node)
      }else {

      }

      // 递归子节点
      if(node.childNodes && node.childNodes.length > 0) {
        this.compile(node)
      }
    })
  }

  // 判断是不是元素节点
  isElement(node) {
    return node.nodeType == 1
  }
  // 判断是不是文本节点
  isInter(node) {
    // 首先是文本标签，其次内容是  {{ xxx }}
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  // 插值绑定
  compileText(node) {
    // node.textContent = this.$vm[RegExp.$1]
    this.update(node, RegExp.$1, 'text')
  }

  compileElement(node) {
    // 节点是元素
    // 遍历其属性列表
    const nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach(attr => {
      // 规定: 指令以 k-xx
      const attrName = attr.name // k-xx
      const exp = attr.value  // oo
      if(this.isDirective(attrName)) {
        const dir = attrName.substring(2)  // xx
        // 执行指令 (假如是 text)  k-text='counter'
        this[dir] && this[dir](node, exp)
      }

      // 事件的处理
      if(this.isEvent(attrName)) {
        // @click="onClick"
        const dir = attrName.substring(1) // click
        // 事件监听
        this.eventHandler(node, exp, dir)
      }
    })
  }
  isDirective(attr) {
    return attr.indexOf('k-') === 0
  }

  // 公共的更新函数
  update(node, exp, dir) {
    // 初始化(除了初始化还会创建一个 watcher)
    // 指令指定的更新函数  xxUpdate
    const fn = this[dir + 'Update']
    fn && fn(node, this.$vm[exp])

    // 更新处理， 分装一个更新函数：可以更新对应的 dom 元素
    new Watcher(this.$vm, exp, function(val) {
      fn && fn(node, val)
    })
  }

  textUpdate(node, value) {
    node.textContent = value
  }
  // k-text
  text(node, exp) {
    // node.textContent = this.$vm[exp]
    this.update(node, exp, 'text')
  }

  // k-html
  html(node, exp) {
    // node.innerHTML = this.$vm[exp]
    this.update(node, exp, 'html')
  }

  htmlUpdate(node, value) {
    node.innerHTML = value
  }

  // 事件的处理
  isEvent(dir) {
    return dir.indexOf('@') == 0
  }
  eventHandler(node, exp, dir) {
    // methods: {onClick: function(){}}
    const fn = this.$vm.$options.methods && this.$vm.$options.methods[exp]
    node.addEventListener(dir, fn.bind(this.$vm))
  }

  //k-model='xx'
  model(node, exp) {
    // update 只完成赋值和更新
    this.update(node, exp, 'model')
    // 事件监听
    node.addEventListener('input', e => {
      // 将新的值赋值给数据即可
      this.$vm[exp] = e.target.value
    })
  }
  modelUpdate(node, value) {
    // 表单元素进行赋值
    node.value = value
  }
}