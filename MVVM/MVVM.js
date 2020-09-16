class MVVM{
    constructor(options){
        // 一上来 先把可用的东西挂载在实例上
        this.$el = options.el;
        this.$data = options.data;

        // 有要编译的模板就就开始编译
        if(this.$el){
            // 数据劫持 就是吧对象的所有属性 改成 get 和 set 方法
            new Observer(this.$data)  // data 里面的数据
            // 代理 （没关系）  vm 代理data 的数据
            this.proxyData(this.$data)
            // 用数据和元素进行编译
            new Compile(this.$el, this)
        }
    }
    proxyData(data){
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                get(){
                    return data[key]
                },
                set(newValue){
                    data[key] = newValue
                }
            })
        })
    }
}

https://github.com/vuejs/vue