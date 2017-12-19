<template>
    <md-card id="view">
        <md-card-header>
            <div class="md-title">View Competition</div>
        </md-card-header>

        <md-card-content>
            <md-table>

                <md-table-row>

                    <!-- competition name -->
                    <md-table-head>{{competition.name}}</md-table-head>

                    <!-- round name -->
                    <md-table-head v-for="(round, idx) in competition.rounds" :key="idx">
                        {{round}}
                    </md-table-head>

                </md-table-row>

                <md-table-row v-for="(team, idx) in competition.teams" :key="idx">

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
            <md-button class="md-accent" :to="{name: 'revisions'}">Revisions</md-button>
            <md-button class="md-primary" :to="{name: 'edit'}">Edit</md-button>
        </md-card-actions>

    </md-card>
</template>

<script>
import {mapState} from "vuex"
export default {
    name: "app-view",
    computed: {
        ...mapState(["competition"])
    }
}
</script>

<style lang="stylus" scoped>
#view
    max-width: 1200px

    .name
        font-weight: bold

</style>
