<template>
    <md-card>
        <md-card-header>
            <div class="md-title">History</div>
        </md-card-header>

        <md-card-content>
            <md-list>
                <md-list-item :to="{name: 'edit'}" >
                    <md-icon>edit</md-icon>
                    <span class="md-list-item-text">Current Revision</span>
                </md-list-item>

                <md-list-item
                    v-for="(revision, idx) in sortedRevisions"
                    :key="idx"
                    :to="{name: 'revision', params: {id: revision.id}}"
                    >
                    <md-icon>history</md-icon>
                    <span class="md-list-item-text">{{revision.timestamp | relative}}</span>
                    <md-tooltip>{{revision.timestamp | prettyTime}}</md-tooltip>
                </md-list-item>
            </md-list>

        </md-card-content>

        <md-card-actions>
            <md-button class="md-primary" @click="back">Back</md-button>
        </md-card-actions>

    </md-card>
</template>

<script>
import orderBy from "lodash/orderBy"
import moment from "moment"
import {mapState} from "vuex"
import store from "../js/store.js"
export default {
    name: "app-revisions",
    computed: {
        ...mapState(["revisions"]),
        sortedRevisions() {
            return orderBy(this.revisions, "id", "desc")
        }
    },
    filters: {
        prettyTime(d) {
            return moment(d).format("MMMM Do YYYY, h:mm:ss a")
        },
        relative(d) {
            return moment(d).fromNow()
        }
    },
    methods: {
        back() {
            if (window.history.length > 1) {
                this.$router.back()
                return
            }
            this.$router.push({name: "view"})
        }
    },
    beforeRouteEnter(to, from, _next) {
        store.dispatch("list_revisions").then(() => {
            _next()
        }).catch(() => {
            _next(false)
        })
    }
}
</script>

<style lang="stylus" scoped>
</style>
