/*global API_BASE*/
/*global Websocket*/

import axios from "axios"

import store from "./store.js"

const api = {
    create_competition(name, rounds, teams, username, password) {
        return store.getters.$http.put(API_BASE + "/competition", {name, rounds, teams, username, password})
    },
    authenticate(username, password) {
        return store.getters.$http.post(API_BASE + "/auth", {username, password})
    },
    write_credentials(username, password) {
        return store.getters.$http.put(API_BASE + "/auth", {username, password})
    },
    read_competition() {
        return axios.get(API_BASE + "/competition")
    },
    write_competition(competition, id) {
        return store.getters.$http.put(API_BASE + "/competition", {competition, id})
    },
    subscribe_competition() {
        // TODO: is there a better way to do this?
        return new WebSocket(API_BASE.replace("http://", "ws://") + "/competition/subscribe")
    },
    list_revisions() {
        return store.getters.$http.get(API_BASE + "/competition/revisions")
    },
    read_revision(id) {
        return store.getters.$http.get(API_BASE + "/competition/revisions/" + id)
    }
}

export default api
