import Link from "./krouter-link";
import View from "./krouter-view";
// import { indexOf } from "core-js/fn/array";

let Vue;

// 1. 实践一个插件，挂载 $router

class KVueRouter {
  constructor(options) {
    this.$options = options;

    // 需要创建响应式的 current 属性
    // 变成响应式，添加key，用到就会收集起来
    // 它就是Vue监听current变量重要执行者,利用 Vue 提供的 defineReactive 做响应化
    // 这样将来 current 变化的时候，依赖的组件会重新 render
    // Vue.util.defineReactive(this, "current", "/");
    this.current = window.location.hash.slice(1) || "/";

    Vue.util.defineReactive(this, "matched", []);
    // match 方法可以递归的遍历由路由表获得匹配关系的数组
    this.match();

    // this.app = new Vue({  // 可以是 this.app.current 使用
    //   data() {
    //     return {
    //       current: '/'
    //     }
    //   }
    // })
    // this.current = '/'  // 表示当前路径
    // 监控 url 的变化 hashchange
    window.addEventListener("hashchange", this.onHashChange.bind(this));
    // 刷新时间 load
    window.addEventListener("load", this.onHashChange.bind(this));

    // 创建一个路由的映射表
    // this.routeMap = {};
    // options.routes.forEach(route => {
    //   this.routeMap[route.path] = route;
    // });
  }
  onHashChange() {
    this.current = window.location.hash.slice(1);
    // 路径发送变化要从新匹配
    this.matched = [];
    this.match();
  }

  match(routes) {
    routes = routes || this.$options.routes;

    // 通过遍历
    for (const route of routes) {
      // 匹配首页
      if (route.path === "/" && this.current === "/") {
        this.matched.push(route);
        return;
      }
      // 假如地址 /about/info  (这个是子路由，嵌套路由)
      if (route.path !== "/" && this.current.indexOf(route.path) != -1) {
        this.matched.push(route);
        if (route.children) {
          this.match(route.children);
        }
        return;
      }
    }
  }
}

KVueRouter.install = function(_Vue) {
  // 保存构造函数，在 KVueRouter 里面去使用
  Vue = _Vue;

  // 挂载 $router, 把路由在页面加载之前挂载到原型链上面
  // 怎么获取根实力中的 router 选项
  Vue.mixin({
    beforeCreate() {
      // 确保根实例的时候执行 ，根实例有 router
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router;
      }
    }
  });

  // 任务2：实现两个全局组件 router-link 和 router-view
  Vue.component("router-link", Link);
  Vue.component("router-view", View);
};

export default KVueRouter;
