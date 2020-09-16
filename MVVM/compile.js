class Compile {
    constructor(el, vm) {

        // 节点
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        if (this.el) {
            // 如果用户能获取到才开始编译
            // 1.先把这些真实的 DOM 移到内存中 fragment
            let fragment = this.node2fragment(this.el)

            // 2.编译 => 提取想要的元素节点 v-model 和文本节点 {{}}
            this.Compile(fragment)

            // 3.把编译好的 fragment 再塞回到页面去
            this.el.appendChild(fragment)
        }
    }

    /* 专门写一些辅助的方法 */
    // 判断获取的是 #app 或者是 document 
    isElementNode(node) {
        return node.nodeType == 1;
    }
    // 是不是指令
    isDirective(name) {
        return name.includes('v-')
    }
    /* 核心的方法 */

    // 编译元素
    CompileElement(node) {
        // 带 v-model
        let attrs = node.attributes; // 取出当前节点属性
        Array.from(attrs).forEach(attr => {
            // 判断属性名字是不是包含 v-
            let attrName = attr.name; // v-model
            if (this.isDirective(attrName)) {
                // 取到对应的值放到节点中
                let expr = attr.value
                let [, type] = attrName.split('-'); // model

                CompileUtil[type](node, this.vm, expr) // (节点，参数，值)
            }
        })
    }
    // 编译文本
    CompileText(node) {
        // 带 {{asd}}
        let expr = node.textContent; // 取出文本内容
        let reg = /\{\{([^}]+)\}\}/g;
        if (reg.test(expr)) {
            CompileUtil['text'](node, this.vm, expr)
        }
    }
    Compile(fragment) {
        // 需要递归
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node => {
            if (this.isElementNode(node)) {
                // 是元素节点，还需要深入的检查
                // 这里需要编译元素
                this.CompileElement(node)
                this.Compile(node)
            } else {
                // 文本节点
                // 这里需要编译文本
                this.CompileText(node)
            }
        })
    }
    node2fragment(el) { //需要将 el 中的内容全部放到内存中
        // 文档碎片 内存中的 dom 节点
        let fragment = document.createDocumentFragment(); // 创建节点
        let firstChild;
        while (firstChild = el.firstChild) {

            fragment.appendChild(firstChild);
        }
        return fragment; // 内存中的节点返回
    }
}

CompileUtil = {
    getVal(vm, expr) { // 获取实例上对应的数据
        expr = expr.split("."); // [a, b, c, d, e, f]
        return expr.reduce((prev, next) => { // vm.$data.a
            return prev[next]
        }, vm.$data)
    },
    getTextVal(vm, expr) { // 获取编译后的文本结果
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            return this.getVal(vm, arguments[1]);
        })
    },
    text(node, vm, expr) { // 文本处理
        let updateFn = this.updater['textUpdater'];
        // vm.$data[expr];  // vm.$data["message.a"]  层级比较深
        // {{message.a}} => hello,zfpx
        let value = this.getTextVal(vm, expr)
        // {{a}}  {{b}}
        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            new Watcher(vm, arguments[1],(newValue) => {
                // 如果数据变化了， 文本节点需要从新获取依赖的属性更新文本中的内容
                updateFn && updateFn(node, this.getTextVal(vm, expr))
            })
        })
        
        updateFn && updateFn(node, value)
    },
    // 取出来（最后）
    setVal(vm, expr, value){  // expr 可能是 message.a
        expr = expr.split('.');
        // 收敛
        return expr.reduce((prev, next, currentIndex) => {
            if(currentIndex === expr.length - 1){
                return prev[next] = value
            }
            return prev[next];
        },vm.$data)
    },
    model(node, vm, expr) { // 输入框处理
        let updateFn = this.updater['modelUpdater'];
        // 这里应该加一个监控， 数据变化了 应该调用这个 watch 的 callback
        new Watcher(vm, expr, (newValue) => {
            // 当值变化后会调用 cb , 将新的值传递过来 ()
            updateFn && updateFn(node, this.getVal(vm, expr));
        })
        // 输入框方法
        node.addEventListener('input', (e) => {
            let newValue = e.target.value
            this.setVal(vm, expr, newValue)
        })
        updateFn && updateFn(node, this.getVal(vm, expr));
    },
    updater: {
        // 文本更新
        textUpdater(node, value) {
            node.textContent = value
        },
        // 输入框更新
        modelUpdater(node, value) {
            node.value = value
        }
    }
}