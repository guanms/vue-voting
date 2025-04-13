import {createRouter, createWebHashHistory} from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CreateVotingView from '../views/CreateVotingView.vue'
import VotingView from '../views/VotingView.vue'

const routes: RouteRecordRaw[] =[
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/create',
        name: 'create',
        component: CreateVotingView
    },
    {
        path: '/voting/:id',
        name: 'voting',
        component: VotingView,
        props: true
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router