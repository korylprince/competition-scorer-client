<template>
    <form novalidate @submit.prevent="write_credentials(username, password)">
        <md-card>
            <md-card-header>
                <div class="md-title">Update Credentials</div>
            </md-card-header>

            <md-card-content>

                <md-field :class="{'md-invalid': errors.has('username')}">
                    <label>Username</label>
                    <md-input ref="username" v-model="username" name="username" v-validate="'required'"></md-input>
                    <span class="md-error">{{errors.first('username')}}</span>
                </md-field>

                <md-field :class="{'md-invalid': errors.has('password')}">
                    <label>Password</label>
                    <md-input type="password" v-model="password" name="password" v-validate="'required'"></md-input>
                    <span class="md-error">{{errors.first('password')}}</span>
                </md-field>

                <md-field :class="{'md-invalid': errors.has('confirm password')}">
                    <label>Confirm Password</label>
                    <md-input type="password" v-model="confirm_password" name="confirm password" v-validate="'required|confirmed:password'"></md-input>
                    <span class="md-error">{{errors.first('confirm password')}}</span>
                </md-field>

            </md-card-content>

            <md-card-actions>
                <md-button class="md-accent" @click="back">Go Back</md-button>
                <md-button type="submit" class="md-primary" :disabled="is_loading">
                    <span v-show="!is_loading">Save</span>
                    <md-progress-spinner
                        class="app-spinner"
                        v-if="is_loading"
                        md-mode="indeterminate"
                        :md-diameter="20"
                        :md-stroke="2"
                        ></md-progress-spinner>
                </md-button>
            </md-card-actions>
        </md-card>
    </form>
</template>

<script>
import {mapState, mapGetters} from "vuex"
import AuthorizedMixin from "./authorized-mixin.js"
export default {
    name: "app-update-credentials",
    mixins: [AuthorizedMixin],
    data() {
        return {
            username: this.$store.state.name,
            password: null,
            confirm_password: null
        }
    },
    computed: {
        ...mapState(["name"]),
        ...mapGetters(["is_loading"])
    },
    methods: {
        back() {
            if (window.history.length > 1) {
                this.$router.go(-1)
                return
            }
            this.$router.push({name: "view"})
        },
        write_credentials(username, password) {
            if (this.is_loading) { return }

            this.$validator.validateAll().catch(() => {
                this.$store.commit("UPDATE_ERROR", "Form validation error")
            }).then(valid => {
                if (valid) {
                    return this.$store.dispatch("write_credentials", {username, password})
                }
                return Promise.reject()
            }).then(() => {
                this.password = null
                this.confirm_password = null
                this.$validator.pause()
                this.$refs.username.$el.focus()
                window.setTimeout(() => {
                    this.$validator.resume()
                }, 200)
            }).catch(() => {
                // ignore other errors
            })
        }
    },
    mounted() {
        this.$refs.username.$el.focus()
    }
}
</script>

<style lang="stylus" scoped>
</style>
