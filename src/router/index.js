import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import Goods from '../components/goods/Goods.vue'
import Addgoods from '../components/goods/Addgoods.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'

Vue.use(VueRouter)

const routes=[
  {path:'/',redirect:'/login'},
  {path:'/login',component:Login},
  {path:'/home',component:Home,redirect:'/welcome',
    children:[
      {path:'/welcome',component:Welcome},
      {path:'/Users',component:Users},
      {path:'/rights',component:Rights},
      {path:'/roles',component:Roles},
      {path:'/categories',component:Cate},
      {path:'/params',component:Params},
      {path:'/goods',component:Goods},
      {path:'/goods/addgoods',component:Addgoods},
      {path:'/orders',component:Order},
      {path:'/reports',component:Report}
    ]
  }
  
]
const router = new VueRouter({
  routes,
  mode:'history'
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // next()直接放行
  if(to.path === '/login') return next();
  const tokenStr=window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login');
  next()
})
export default router