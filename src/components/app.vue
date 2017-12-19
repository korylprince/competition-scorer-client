<template>
    <div id="root" ref="app" :class="{'page-container': true, fullscreen: fullscreen}">
        <md-app>
            <md-app-toolbar class="md-primary md-dense" v-show="!fullscreen">
                <router-link class="md-title" :to="{name: 'view'}">Competition Scorer</router-link>

                <span v-show="signed_in">{{name}}</span>

                <div v-show="signed_in">
                    <md-menu md-direction="bottom-start">
                        <md-button class="md-icon-button" md-menu-trigger>
                            <md-icon>more_vert</md-icon>
                        </md-button>

                        <md-menu-content>
                            <md-menu-item :to="{name: 'update-credentials'}">Update Credentials</md-menu-item>
                            <md-menu-item @click="signout">Sign Out</md-menu-item>
                        </md-menu-content>
                    </md-menu>
                </div>
            </md-app-toolbar>

            <md-app-content id="content">
                <router-view></router-view>
            </md-app-content>
        </md-app>

        <md-dialog-alert
            :md-active="show_dialog"
            @update:mdActive="$store.commit('UPDATE_ERROR', null)"
            md-title="Error"
            :md-content="error"
            >
        </md-dialog-alert>

        <md-snackbar
            :md-active="show_snackbar"
            @update:mdActive="$store.commit('UPDATE_FEEDBACK', null)"
            >
            <span>{{feedback}}</span>
        </md-snackbar>
    </div>
</template>

<script>
import {mapState, mapGetters} from "vuex"
export default {
    name: "my-app",
    data() {
        return {
            mouse_active: true,
            mouse_timer: null
        }
    },
    computed: {
        onView() {
            return this.$route.name === "view"
        },
        fullscreen() {
            return !this.mouse_active && this.onView
        },
        ...mapState({
            "name": "name",
            "error": "last_error",
            "feedback": "last_feedback"
        }),
        ...mapGetters(["signed_in", "show_dialog", "show_snackbar"])
    },
    watch: {
        onView(val) {
            if (!val) {
                this.$refs.app.removeEventListener("mousemove", this.mouse_listener)
                window.clearTimeout(this.mouse_timer)
                return
            }

            this.mouse_timer = window.setTimeout(() => {
                this.mouse_active = false
            }, 5000)

            this.$refs.app.addEventListener("mousemove", this.mouse_listener)
        }
    },
    methods: {
        signout() {
            this.$store.dispatch("signout")
        },
        mouse_listener() {
            this.mouse_active = true
            window.clearTimeout(this.mouse_timer)
            this.mouse_timer = window.setTimeout(() => {
                this.mouse_active = false
            }, 5000)
        }
    }
}
</script>


<style lang="stylus">
#root, &>.md-app
    min-height: 100vh

    &.fullscreen

        cursor: none

        .md-app-container
            overflow: hidden

        #content, #content .md-card
            max-width: inherit
            height: 100vh
            width: 100vw
            margin: 0
            padding: 0

        #view
            padding: 50px

            .md-card-header, .md-card-actions
                display: none

            .md-table-head
                font-size: 2rem

            .md-table-cell
                font-size: 1.5rem

.md-toolbar .md-title
    flex: 1

    &:hover
        text-decoration: none
        font-weight: 500

#content
    background-color: inherit

    > div, form
        max-width: 600px
        margin-left: auto
        margin-right: auto
</style>
