import Vue from 'vue'
import App from './App.vue'
import router from './router/'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'

import tree from 'vue-table-with-tree-grid'

// 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
Vue.use(VueQuillEditor, /* { default global options } */)

// 导入进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/';
// 配置请求拦截器   并在request拦截器中展示进度条
axios.interceptors.request.use(config=>{
  NProgress.start()
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem("token")
  return config
})
// 配置请求拦截器   并在request拦截器中结束进度条
axios.interceptors.response.use(config =>{
  NProgress.done()
  return config
})
Vue.prototype.$http = axios


import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.config.productionTip = false
Vue.component('tree',tree)
Vue.use(ElementUI);

// 注册全局过滤器
Vue.filter('dateFormat',function(originVal){
 const dt = new Date(originVal)

 const y = dt.getFullYear()
 const m = (dt.getMonth() + 1+ "").padStart(2,'0')
 const d = (dt.getDate() + "").padStart(2,'0')

 const hh = (dt.getHours()+'').padStart(2,'0')
 const mm = (dt.getMinutes()+'').padStart(2,'0')
 const ss = (dt.getSeconds()+'').padStart(2,'0')

 return `${y}-${m}-${d}  ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
