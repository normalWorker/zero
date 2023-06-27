import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import About from "../views/About.vue";
import Contact from "../views/Contact.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "home",
    component: Home,
  },
  {
    path: "/about",
    name: "about",
    component: About,
  },
  {
    path: "/contact",
    name: "contact",
    component: Contact,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  console.log(to.path, from.path);
  // 判断目标路由和当前路由是否相同
  if (to.path === from.path) {
    // 如果相同，避免进行冗余的导航
    console.log("false");
    return;
  } else {
    console.log("aaaaa");
    next();
  }

  // 继续导航到目标路由
});

export default router;
