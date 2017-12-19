import "./fonts/roboto.css"
import "./fonts/material-icons.css"
import "vue-material/dist/vue-material.css"
import "./style/theme.scss"
import "./style/app.styl"

import Vue from "vue"
import VueMaterial from "vue-material"
import VeeValidate from "vee-validate"

Vue.use(VueMaterial)
Vue.use(VeeValidate)

import router from "./js/router.js"
import store from "./js/store.js"

import MyApp from "./components/app.vue"

// start app by checking if competition is inited yet
store.dispatch("read_competition").then(() => {
    store.commit("UPDATE_APP_STATUS", "STARTED")
}).catch(error => {
    store.commit("UPDATE_APP_STATUS", "STARTED")
    if (error != null && error.status === 404) {
        router.push({name: "create"})
    }
})

// wait to route until application is started
router.beforeEach((to, from, next) => {
    if (store.state.app_status !== "STARTED") {
        var stop_watch = store.watch(state => { return state.app_status }, status => {
            if (status === "STARTED") {
                next()
                stop_watch()
            }
        })
        return
    }

    next()
})

// if competition isn't created, always send to /create
router.beforeEach((to, from, next) => {
    if (to.name !== "create" && store.state.competition == null) {
        next({name: "create"})
        return
    }
    next()
})

// if signed out, go to signin page
store.watch((state, getters) => { return getters.signed_in }, signed_in => {
    if (!signed_in) {
        router.push({name: "signin"})
    }
})

var App = new (Vue.extend(MyApp))({
    el: "#root",
    router,
    store
})

export default App
