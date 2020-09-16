class Observer{
    constructor(data){
        this.observe(data)
    }
    observe(data){  // data 是对象的形式
        // 要对这个 data 数据将原有的属性改成 set 和 get 的形式
        if(!data || typeof data !== 'object'){
            return ;
        }

        // 要将数据一一劫持 先获取到 data 的 key 和 value
        // 将对象的 key 转化成数组去操作
        Object.keys(data).forEach(key => {
            // 劫持
            this.defineReactive(data, key, data[key]);
            this.observe(data[key]) // 深度递归劫持
        })
    }

    // 定义响应式
    defineReactive(obj, key, value){
        // 在获取某个值的时候 写个框
        let that = this
        let dep = new Dep()  // 每个变化的数据都会对应一个数组，这个数组是存放数组更新的作用
        Object.defineProperty(obj, key, {
            enumerable: true, // 可以循环出来
            configurable: true, // 可以删除掉
            get(){ // 当取值时候调用的方法
                Dep.target && dep.addSub(Dep.target)
                return value;
            },
            set(newValue){  // 当给 data 属性中设置值的时候 更改获取属性的值
                if(newValue != value){
                    // 这里的 this 不是实例
                    that.observe(newValue)  // 如果这个是对象继续劫持
                    value = newValue
                    dep.notify();  // 通知所有人数据更新了，一个一个去掉数组更新的方法
                }
            }
        })
    }
}

class Dep{
    constructor(){
        // 订阅的数组
        this.subs = []
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(watcher => watcher.update())
    }
}