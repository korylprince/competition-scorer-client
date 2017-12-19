<template>
    <form novalidate @submit.prevent="create(name, rounds, teams, username, password)">
        <md-card>
            <md-card-header>
                <div class="md-title">Create Competition</div>
            </md-card-header>

            <md-card-content>

                <md-field :class="{'md-invalid': errors.has('competition name')}">
                    <label>Competition Name</label>
                    <md-input ref="name" v-model="name" name="competition name" v-validate="'required'"></md-input>
                    <span class="md-error">{{errors.first('competition name')}}</span>
                </md-field>

                <md-field :class="{'md-invalid': errors.has('rounds')}">
                    <label>Rounds</label>
                    <md-input type="number" v-model.number="rounds" name="rounds" v-validate="'required|numeric|min_value:1'"></md-input>
                    <span class="md-error">{{errors.first('rounds')}}</span>
                </md-field>

                <span class="md-subheading app-subheading">Teams</span>

                <md-field v-for="(team, idx) in teams" :class="{'md-invalid': errors.has('team ' + (idx + 1) + ' name')}" :key="idx">
                    <label>Team {{idx + 1}} Name</label>
                    <md-input v-model="teams[idx]" :name="'team ' + (idx + 1) + ' name'" v-validate="'required'"></md-input>
                    <span>
                        <md-icon @click.native="removeTeam(idx)">close</md-icon>
                        <md-tooltip>Remove</md-tooltip>
                    </span>
                    <span class="md-error">{{errors.first("team " + (idx + 1) + " name")}}</span>
                </md-field>

                <div style="text-align: center">
                    <md-button
                        class="md-icon-button md-raised md-primary"
                        @click="teams.push(null)"
                        >
                        <md-icon>add</md-icon>
                        <md-tooltip>Add Team</md-tooltip>
                    </md-button>
                </div>

                <span class="md-subheading app-subheading">Credentials</span>

                <md-field :class="{'md-invalid': errors.has('username')}">
                    <label>Username</label>
                    <md-input v-model="username" name="username" v-validate="'required'"></md-input>
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
                <md-button type="submit" class="md-primary" :disabled="is_loading">
                    <span v-show="!is_loading">Create</span>
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
import {mapGetters} from "vuex"
export default {
    name: "app-create",
    data() {
        return {
            name: null,
            rounds: null,
            teams: [null],
            username: null,
            password: null,
            confirm_password: null
        }
    },
    computed: {
        ...mapGetters(["is_loading"])
    },
    methods: {
        removeTeam(idx) {
            this.teams.splice(idx, 1)
            this.errors.clear("team " + (idx + 1) + " name")
            if (this.teams.length === 0) {
                this.teams.push(null)
            }
        },
        create(name, rounds, teams, username, password) {
            if (this.is_loading) { return }

            this.$validator.validateAll().catch(() => {
                this.$store.commit("UPDATE_ERROR", "Form validation error")
            }).then(valid => {
                if (valid) {
                    return this.$store.dispatch("create_competition", {name, rounds, teams, username, password})
                }
                return Promise.reject()
            }).then(() => {
                this.$router.push({name: "view"})
            }).catch(() => {
                // ignore other errors
            })
        }
    },
    beforeCreate() {
        if (this.$store.state.competition != null) {
            this.$router.push({name: "view"})
        }
    },
    mounted() {
        this.$refs.name.$el.focus()
    }
}
</script>

<style lang="stylus" scoped>
.md-subheading.app-subheading
    display: block
    font-size: 1.25rem
    margin-top: 50px
</style>
