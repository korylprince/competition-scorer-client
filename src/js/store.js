import axios from "axios"

import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

import api from "./api.js"
import router from "./router.js"

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== "production",
    state: {
        app_status: "STARTING",
        last_error: null,
        last_feedback: null,
        _loading_count: 0,
        name: window.localStorage.getItem("name"),
        session_id: window.localStorage.getItem("session_id"),
        subscription_id: null,
        _next_route: null,
        next_dispatch_action: null,
        next_dispatch_payload: null,
        competition: null,
        external_edit: false,
        revisions: null,
        revision: null
    },
    getters: {
        is_loading(state) {
            return state._loading_count !== 0
        },
        next_route(state) {
            if (state._next_route == null) {
                return null
            }
            // deep copy
            return JSON.parse(JSON.stringify(state._next_route))
        },
        signed_in(state) {
            return state.session_id != null && state.competition != null
        },
        show_dialog(state) {
            return state.last_error != null && router.currentRoute.name !== "signin"
        },
        show_snackbar(state) {
            return state.last_feedback != null
        },
        $http(state, getters) {
            if (!getters.signed_in) {
                return null
            }
            return axios.create({
                headers: {Authorization: "SESSION id=" + state.session_id}
            })
        }
    },
    mutations: {
        UPDATE_APP_STATUS(state, status) {
            state.app_status = status
        },
        UPDATE_ERROR(state, error) {
            state.last_error = error
        },
        UPDATE_FEEDBACK(state, msg) {
            state.last_feedback = msg
        },
        START_LOADING(state) {
            state._loading_count++
            state.last_error = null
        },
        STOP_LOADING(state) {
            state._loading_count--
        },
        UPDATE_CREDENTIALS(state, {name, session_id}) {
            state.name = name
            window.localStorage.setItem("name", name)
            state.session_id = session_id
            window.localStorage.setItem("session_id", session_id)
        },
        SIGNOUT(state) {
            state.name = null
            window.localStorage.removeItem("name")
            state.session_id = null
            window.localStorage.removeItem("session_id")
        },
        UPDATE_SUBSCRIPTION_ID(state, id) {
            state.subscription_id = id
        },
        UPDATE_NEXT_ROUTE(state, route) {
            state._next_route = JSON.parse(JSON.stringify(route))
        },
        UPDATE_NEXT_DISPATCH(state, {action, payload}) {
            state.next_dispatch_action = action
            state.next_dispatch_payload = payload
        },
        UPDATE_COMPETITION(state, {competition, external}) {
            state.external_edit = external
            state.competition = competition
        },
        UPDATE_REVISIONS(state, revisions) {
            state.revisions = revisions
        },
        UPDATE_REVISION(state, revision) {
            state.revision = revision
        }
    },
    actions: {
        authenticate(context, {username, password}) {
            context.commit("START_LOADING")

            var promise = api.authenticate(username, password)
            promise.then(response => {
                var session_id = response.data.session_id
                context.commit("STOP_LOADING")
                context.commit("UPDATE_CREDENTIALS", {name: username, session_id})
            }).catch(error => {
                context.commit("STOP_LOADING")
                if (error.response != null && error.response.status === 401) {
                    context.commit("UPDATE_ERROR", "Wrong email or password")
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        },
        write_credentials(context, {username, password}) {
            context.commit("START_LOADING")

            var promise = api.write_credentials(username, password)
            promise.then(() => {
                context.commit("STOP_LOADING")
                context.commit("UPDATE_CREDENTIALS", {name: username, session_id: context.state.session_id})
                context.commit("UPDATE_FEEDBACK", "Credentials saved")
            }).catch(error => {
                context.commit("STOP_LOADING")
                if (error.response != null && error.response.status === 401) {
                    context.commit("SIGNOUT")
                    context.commit("UPDATE_FEEDBACK", "Session expired. Please sign back in")
                    context.commit("UPDATE_NEXT_ROUTE", {"name": "update-credentials"})
                    context.commit("UPDATE_NEXT_DISPATCH", {action: "write_credentials", payload: {username, password}})
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        },
        signout(context) {
            context.commit("SIGNOUT")
        },
        next_dispatch(context) {
            return context.dispatch(context.state.next_dispatch_action, context.state.next_dispatch_payload).finally(() => {
                context.commit("UPDATE_NEXT_DISPATCH", {action: null, payload: null})
            })
        },
        create_competition(context, {name, rounds, teams, username, password}) {
            context.commit("START_LOADING")

            var promise = api.create_competition(name, rounds, teams, username, password)
            promise.then(response => {
                var competition = response.data.competition
                var session_id = response.data.session_id
                context.commit("STOP_LOADING")
                context.commit("UPDATE_CREDENTIALS", {name: username, session_id})
                context.commit("UPDATE_COMPETITION", {competition, external: false})
                context.commit("UPDATE_FEEDBACK", "Competition created")
            }).catch(error => {
                context.commit("STOP_LOADING")
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        },
        read_competition(context, external = false) {
            context.commit("START_LOADING")

            var promise = api.read_competition()
            promise.then(response => {
                var competition = response.data
                context.commit("STOP_LOADING")
                context.commit("UPDATE_COMPETITION", {competition, external})
            }).catch(error => {
                context.commit("STOP_LOADING")
                if (error != null && error.response != null && error.response.status === 404) { return }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        },
        write_competition(context, competition) {
            context.commit("START_LOADING")

            var promise = api.write_competition(competition, context.state.subscription_id)
            promise.then(() => {
                context.commit("STOP_LOADING")
                context.commit("UPDATE_COMPETITION", {competition, external: false})
                context.commit("UPDATE_FEEDBACK", "Competition saved")
            }).catch(error => {
                context.commit("STOP_LOADING")
                if (error.response != null && error.response.status === 401) {
                    context.commit("SIGNOUT")
                    context.commit("UPDATE_FEEDBACK", "Session expired. Please sign back in")
                    context.commit("UPDATE_NEXT_ROUTE", {"name": "edit"})
                    context.commit("UPDATE_NEXT_DISPATCH", {action: "write_competition", payload: competition})
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        },
        list_revisions(context) {
            context.commit("START_LOADING")

            var promise = api.list_revisions()
            promise.then(response => {
                var revisions = response.data.revisions
                context.commit("STOP_LOADING")
                context.commit("UPDATE_REVISIONS", revisions)
            }).catch(error => {
                context.commit("STOP_LOADING")
                if (error.response != null && error.response.status === 401) {
                    context.commit("SIGNOUT")
                    context.commit("UPDATE_FEEDBACK", "Session expired. Please sign back in")
                    context.commit("UPDATE_NEXT_ROUTE", {"name": "revisions"})
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        },
        read_revision(context, id) {
            context.commit("START_LOADING")

            var promise = api.read_revision(id)
            promise.then(response => {
                var revision = response.data
                context.commit("STOP_LOADING")
                context.commit("UPDATE_REVISION", revision)
            }).catch(error => {
                context.commit("STOP_LOADING")
                if (error.response != null && error.response.status === 401) {
                    context.commit("SIGNOUT")
                    context.commit("UPDATE_FEEDBACK", "Session expired. Please sign back in")
                    context.commit("UPDATE_NEXT_ROUTE", {"name": "revisions", params: {id}})
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        }
    }
})

api.subscribe_competition().onmessage = event => {
    if (event.data == null) { return }
    var msg = JSON.parse(event.data)
    if (msg.type === "connect") {
        store.commit("UPDATE_SUBSCRIPTION_ID", msg.id)
    } else if (msg.type === "update" && msg.id !== store.state.subscription_id) {
        store.dispatch("read_competition", true)
    }
}

export default store
