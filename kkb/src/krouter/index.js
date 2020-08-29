import Vue from "vue";
import VueRouter from "./kvue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter); // 先执行，这个时候没有实例，应用插件

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
    children: [
      {
        path: "/about/info",
        component: {
          render(h) {
            return h("div", "info page");
          }
        }
      }
    ]
  }
];

// 创建实例
const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
