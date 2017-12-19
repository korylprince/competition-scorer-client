import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

import AppSignin from "../components/signin.vue"
import AppCreate from "../components/create.vue"
import AppEdit from "../components/edit.vue"
import AppView from "../components/view.vue"
import AppRevisions from "../components/revisions.vue"
import AppRevision from "../components/revision.vue"
import AppUpdateCredentials from "../components/credentials.vue"

const router = new VueRouter({
    routes: [
        {name: "signin", path: "/signin", component: AppSignin},
        {name: "create", path: "/create", component: AppCreate},
        {name: "edit", path: "/edit", component: AppEdit},
        {name: "view", path: "/view", component: AppView},
        {name: "revisions", path: "/revisions", component: AppRevisions},
        {name: "revision", path: "/revisions/:id", component: AppRevision},
        {name: "update-credentials", path: "/credentials", component: AppUpdateCredentials},
        {path: "*", redirect: {name: "view"}}
    ]
})

export default router
