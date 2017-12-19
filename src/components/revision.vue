<template>
    <md-card>
        <md-card-header>
            <div class="md-title">View Revision</div>
            <div class="md-subhead">{{revision.timestamp | prettyTime}}</div>
        </md-card-header>

        <md-card-content>
            <md-table>

                <md-table-row>

                    <!-- competition name -->
                    <md-table-head>{{revision.competition.name}}</md-table-head>

                    <!-- round name -->
                    <md-table-head v-for="(round, idx) in revision.competition.rounds" :key="idx">
                        {{round}}
                    </md-table-head>

                </md-table-row>

                <md-table-row v-for="(team, idx) in revision.competition.teams" :key="idx">

                    <!-- team name -->
                    <md-table-cell>
                        <span class="name">{{team.name}}</span>
                    </md-table-cell>

                    <!-- scores -->
                    <md-table-cell v-for="(score, sidx) in team.scores" :key="sidx">
                        {{score}}
                    </md-table-cell>

                </md-table-row>

            </md-table>

        </md-card-content>

        <md-card-actions>
            <md-button class="md-accent" @click="back">Back</md-button>
            <div>
                <md-button class="md-primary" @click="restore(revision.competition)" :disabled="!dirty">Restore</md-button>
                <md-tooltip v-if="!dirty">Competition already matches this revision</md-tooltip>
            </div>
        </md-card-actions>

    </md-card>
</template>

<script>
import moment from "moment"
import store from "../js/store.js"
import {mapState} from "vuex"
export default {
    name: "app-revision",
    computed: {
        dirty() {
            return !(JSON.stringify(this.revision.competition) === JSON.stringify(this.competition))
        },
        ...mapState(["revision", "competition"])
    },
    filters: {
        prettyTime(d) {
            return moment(d).format("MMMM Do YYYY, h:mm:ss a")
        }
    },
    methods: {
        back() {
            if (window.history.length > 1) {
                this.$router.back()
                return
            }
        },
        restore(competition) {
            this.$store.dispatch("write_competition", competition).then(() => {
                this.$router.push({name: "edit"})
            }).catch(() => {
                // ignore other errors
            })
        }
    },
    beforeRouteEnter(to, from, _next) {
        store.dispatch("read_revision", to.params.id).then(() => {
            _next()
        }).catch(() => {
            _next(false)
        })
    }
}
</script>

<style lang="stylus" scoped>
</style>
