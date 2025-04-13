import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/router' // 引入 router.ts

createApp(App)
    .use(router) // 使用引入的路由配置
    .mount('#app')
