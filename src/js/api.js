/*global API_BASE*/
/*global WebSocket*/

import axios from "axios"

import store from "./store.js"

const api = {
    create_competition(name, rounds, teams, username, password) {
        return axios.put(API_BASE + "/competition", {name, rounds, teams, username, password})
    },
    authenticate(username, password) {
        return axios.post(API_BASE + "/auth", {username, password})
    },
    write_credentials(username, password) {
        var $http = store.getters.$http
        if ($http == null) { return Promise.reject({response: {status: 401}}) }
        return $http.put(API_BASE + "/auth", {username, password})
    },
    read_competition() {
        return axios.get(API_BASE + "/competition")
    },
    write_competition(competition, id) {
        var $http = store.getters.$http
        if ($http == null) { return Promise.reject({response: {status: 401}}) }
        return $http.put(API_BASE + "/competition", {competition, id})
    },
    subscribe_competition() {
        var url = new URL(API_BASE, document.location)
        url.protocol = "ws:"
        return new WebSocket(url.href + "/competition/subscribe")
    },
    list_revisions() {
        var $http = store.getters.$http
        if ($http == null) { return Promise.reject({response: {status: 401}}) }
        return $http.get(API_BASE + "/competition/revisions")
    },
    read_revision(id) {
        var $http = store.getters.$http
        if ($http == null) { return Promise.reject({response: {status: 401}}) }
        return $http.get(API_BASE + "/competition/revisions/" + id)
    }
}

export default api
