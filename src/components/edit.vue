<template>
    <form id="edit-form" novalidate @submit.prevent="save(competition)">
        <md-card>
            <md-card-header>
                <div class="md-title">Edit Competition</div>
            </md-card-header>

            <md-card-content>
                <md-table>

                    <md-table-row>

                        <!-- competition name -->
                        <md-table-cell :colspan="editable ? 2 : 1">
                            <input
                            :class="{name: true, error: errors.has('competition')}"
                            v-if="editable"
                            v-model.trim="competition.name"
                            name="competition"
                            v-validate="'required'"
                            />
                        <span class="name" v-if="!editable">{{competition.name}}</span>
                    </md-table-cell>

                    <!-- round name -->
                    <md-table-cell v-for="(round, idx) in competition.rounds" :key="idx">
                        <input
                        :class="{round: true, error: errors.has('round' + idx.toString())}"
                        v-if="editable"
                        v-model.trim="competition.rounds[idx]"
                        :name="'round' + idx.toString()"
                        v-validate="'required'"
                        />
                    <span class="round" v-if="!editable">{{competition.rounds[idx]}}</span>
                </md-table-cell>

                <!-- add rounds -->
                <md-table-cell v-if="editable" class="dense" :rowspan="2 + competition.teams.length">
                    <md-button
                        class="md-icon-button md-dense md-primary md-raised"
                        @click="addRound"
                        >
                        <md-icon>add</md-icon>
                        <md-tooltip>Add Round</md-tooltip>
                    </md-button>
                </md-table-cell>

            </md-table-row>

            <md-table-row v-if="editable">

                <!-- empty space -->
                <md-table-cell class="dense" colspan="2"></md-table-cell>

                <!-- remove rounds -->
                <md-table-cell class="dense "v-for="(round, idx) in competition.rounds" :key="idx">
                    <md-button
                        class="md-icon-button md-dense md-accent md-raised"
                        @click="removeRound(idx)"
                        >
                        <md-icon>close</md-icon>
                        <md-tooltip>Remove Round</md-tooltip>
                    </md-button>
                </md-table-cell>

            </md-table-row>

            <md-table-row v-for="(team, idx) in competition.teams" :key="idx">

                <!-- remove team -->
                <md-table-cell v-if="editable" class="dense">
                    <md-button
                        class="md-icon-button md-dense md-accent md-raised"
                        @click="removeTeam(idx)"
                        >
                        <md-icon>close</md-icon>
                        <md-tooltip>Remove Team</md-tooltip>
                    </md-button>
                </md-table-cell>

                <!-- team name -->
                <md-table-cell>
                    <input
                    :class="{name: true, error: errors.has('team' + idx.toString())}"
                    v-if="editable"
                    v-model.trim="team.name"
                    :name="'team' + idx.toString()"
                    v-validate="'required'"
                    />
                <span class="name" v-if="!editable">{{team.name}}</span>
            </md-table-cell>

            <!-- scores -->
            <md-table-cell v-for="(score, sidx) in team.scores" :key="sidx">
                <input
                :class="{name: true, error: errors.has('team' + idx.toString() + 'score' + sidx.toString())}"
                type="number"
                v-model.number="team.scores[sidx]"
                :name="'team' + idx.toString() + 'score' + sidx.toString()"
                v-validate="'numeric'"
                />
        </md-table-cell>

    </md-table-row>

    <md-table-row v-if="editable">

        <!-- add team -->
        <md-table-cell :colspan="3 + competition.rounds.length" style="text-align: center">
            <md-button
                class="md-icon-button md-dense md-primary md-raised"
                @click="addTeam"
                >
                <md-icon>add</md-icon>
                <md-tooltip>Add Team</md-tooltip>
            </md-button>
        </md-table-cell>

    </md-table-row>

</md-table>

<span>
    <md-switch v-model="editable" :disabled="editable && errors.any()">Edit Rounds/Teams</md-switch>
    <md-tooltip v-if="editable && errors.any()">Please correct errors</md-tooltip>
</span>

        </md-card-content>

        <md-card-actions>
            <md-button class="md-accent" @click="back">
                Back 
            </md-button>

            <md-button class="md-accent" :disabled="!dirty" @click="revertCompetition">
                Undo Changes
            </md-button>
            <md-button type="submit" class="md-primary" :disabled="is_loading || !dirty || errors.any()">
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

    <md-dialog-confirm
        :md-active.sync="showRevertDialog"
        md-title="Load Changes?"
        md-content="Another session has made changes to the competition, but you have unsaved changes. If you click <strong>Load Changes</strong>, your unsaved changes will be discarded and the updated changes will be loaded. If you click <strong>Ignore</strong>, you'll be able to save your changes, overwriting the other session's changes."
        md-confirm-text="Load Changes"
        md-cancel-text="Ignore"
        @md-confirm="revertCompetition" />

    <md-dialog-confirm
        :md-active.sync="showLeaveDialog"
        md-title="Leave without saving?"
        md-content="Are you sure you want to leave without saving your changes?"
        md-confirm-text="Leave"
        md-cancel-text="Cancel"
        @md-cancel="next(false)"
        @md-confirm="next()" />

</form>
</template>

<script>
import {mapState, mapGetters} from "vuex"
import AuthorizedMixin from "./authorized-mixin.js"
export default {
    name: "app-edit",
    mixins: [AuthorizedMixin],
    data() {
        return {
            editable: false,
            showRevertDialog: false,
            showLeaveDialog: false,
            _next: null,
            // deep copy
            competition: JSON.parse(JSON.stringify(this.$store.state.competition))
        }
    },
    computed: {
        dirty() {
            return !(JSON.stringify(this.competition) === JSON.stringify(this.competition_master))
        },
        ...mapState({competition_master: "competition", external_edit: "external_edit"}),
        ...mapGetters(["is_loading"])
    },
    watch: {
        competition_master(newCompetition, oldCompetition) {
            if (!this.external_edit) {
                return
            }

            if (JSON.stringify(this.competition) === JSON.stringify(oldCompetition) ||
                JSON.stringify(this.competition) === JSON.stringify(newCompetition)
            ) {
                this.revertCompetition()
                this.$store.commit("UPDATE_FEEDBACK", "Loaded changes from another session")
                return
            }

            this.showRevertDialog = true
        }
    },
    methods: {
        back() {
            if (window.history.length > 1) {
                this.$router.back()
                return
            }
            this.$router.push({name: "view"})
        },
        next(val) {
            this._next(val)
            this._next = null
        },
        removeRound(idx) {
            this.competition.rounds.splice(idx, 1)
            this.competition.teams.forEach(team => {
                team.scores.splice(idx, 1)
            })

            if (this.competition.rounds.length === 0) {
                this.competition.rounds.push("Round 1")
                this.competition.teams.forEach(team => {
                    team.scores.push(null)
                })
            }
        },
        addRound() {
            this.competition.rounds.push("Round " + (this.competition.rounds.length + 1))
            this.competition.teams.forEach(team => {
                team.scores.push(null)
            })
        },
        removeTeam(idx) {
            this.competition.teams.splice(idx, 1)
            if (this.competition.teams.length === 0) {
                this.competition.teams.push({name: "Team 1", scores: new Array(this.competition.rounds.length)})
            }
        },
        addTeam() {
            this.competition.teams.push({
                name: "Team " + (this.competition.teams.length + 1),
                scores: new Array(this.competition.rounds.length)
            })
        },
        revertCompetition() {
            this.competition = JSON.parse(JSON.stringify(this.$store.state.competition))
        },
        save(competition) {
            if (this.is_loading) { return }

            this.$validator.validateAll().catch(() => {
                this.$store.commit("UPDATE_ERROR", "Form validation error")
            }).then(valid => {
                if (valid) {
                    var copy = JSON.parse(JSON.stringify(this.competition))

                    // make sure empty scores are null
                    for (var t = 0; t < copy.teams.length; t++) {
                        for (var s = 0; s < copy.teams[t].scores.length; s++) {
                            if (copy.teams[t].scores[s] === "") {
                                copy.teams[t].scores[s] = null
                            }
                        }
                    }

                    this.$store.dispatch("write_competition", copy)
                } else {
                    this.$store.commit("UPDATE_ERROR", "Something's wrong with the form. Please correct all of the red fields and try saving again.")
                }
            }).catch(() => {
                // ignore other errors
            })
        }
    },
    beforeRouteLeave(to, from, next) {
        if (this.dirty) {
            this._next = next
            this.showLeaveDialog = true
            return
        }
        next()
    }
}
</script>

<style lang="stylus" scoped>
#edit-form
    max-width: 1200px

    input
        width: 100%
        min-width: 80px
        padding: 3px 10px
        border: 1px solid #ddd

        &.name
            min-width: 175px

        &.error
            background-color: #f00

    .name, .round
        font-weight: bold

    .dense 
        padding: 0px

        /deep/ .md-table-cell-container
            text-align: center
            padding: 0px
</style>
