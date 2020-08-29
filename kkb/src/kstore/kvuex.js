// 保存构造函数引用，避免 import
let Vue;

class Store {
  constructor(options) {
    this.$options = options;
    this._mutations = options.mutations;
    this._actions = options.actions;
    this._wrappedGetters = options.getters;

    // 定义 computed 选项
    const computed = {};
    this.getters = {};
    const store = this;

    // getters 里面的内容
    Object.keys(this._wrappedGetters).forEach(key => {
      // 获取用户定义的 getter
      const fn = store._wrappedGetters[key];
      // 转化为 computed 可以使用无参数形式
      computed[key] = function() {
        return fn(store.state);
      };
      // 为 getters 定义只读属性
      Object.defineProperty(store.getters, key, {
        get: () => store._vm[key]
      });
    });

    // 响应化处理 state
    // this.state = new Vue({
    //   data: options.state
    // });
    this._vm = new Vue({
      data: {
        // 加两个$, Vue 不做代理，访问不到，这个是隐藏的
        $$state: options.state
      },
      computed
    });

    // 绑定 commit.dispatch 的上下文 store 实例
    this.commit = this.commit.bind(this);
    this.dispatch = this.dispatch.bind(this);
  }

  // 存取器  // 官网是监听任何修改，watch  不可以让用户修改
  get state() {
    // console.log(this._vm);
    return this._vm.$data.$$state;
  }

  set state(v) {
    console.error("不可以这样不好，不可修改");
  }
  // store.commit('add', 1)
  // type: mutation 的类型
  // payload: 载荷, 是用户传过来的参数
  commit(type, payload) {
    const entry = this._mutations[type];
    if (entry) {
      entry(this.state, payload);
    }
  }

  dispatch(type, payload) {
    const entry = this._actions[type];
    if (entry) {
      entry(this, payload);
    }
  }
}

function install(_Vue) {
  Vue = _Vue;

  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        // store 指的是 main.js 里面的 store
        Vue.prototype.$store = this.$options.store;
      }
    }
  });
}

export default {
  Store,
  install
};
