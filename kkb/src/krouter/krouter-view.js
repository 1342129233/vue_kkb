export default {
  render(h) {
    // 标记当前 router-view 的深度  (routerView 属性标记为 true)(routerView 都为 true)(在虚拟组件里面的 data 加上一个属性)(这样就是一个 router-view 了)
    this.$vnode.data.routerView = true;

    // 深度
    let depth = 0;

    // 想办法找到老爹  (this.$parent 可以访问到父组件 上所有的 data(){ 里的数据信息和生命周期方法，methods里的方法 }！)
    let parent = this.$parent;
    console.log(parent)
    while (parent) {  // 查看老爹是不是一个 routerView
      const vnodeData = parent.$vnode && parent.$vnode.data;
      // 如果老爹的虚拟 dom 存在
      if (vnodeData) {
        if (vnodeData.routerView) {
          // 说明当前的parent 是一个 router-view
          depth++;
        }
      }
      parent = parent.$parent;
    }
    // 获取 path 对应的 component, current 地址
    // const { routeMap, current } = this.$router;
    // let component = routeMap[current].component || null;
    let component = null;
    // 匹配到对应的路由的 component 渲染出来
    const route = this.$router.matched[depth];
    if (route) {
      component = route.component;
    }

    // let component = null
    // this.$router.$options.routes.forEach(route => {
    //   if (route.path === this.$router.current) {
    //     component = route.component
    //   }
    // })
    return h(component);
  }
};
