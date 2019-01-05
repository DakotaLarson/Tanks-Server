import EventHandler from "../EventHandler";
import TeamEliminationMatch from "../match/TeamEliminationMatch";
import * as PacketSender from "../PacketSender";
import TeamEliminationPlayerStatistic from "./TeamEliminationPlayerStatistic";

export default class TeamEliminationMatchStatistics {

    private match: TeamEliminationMatch;

    private teamAShots: number;
    private teamBShots: number;

    private teamAHits: number;
    private teamBHits: number;

    private teamAKills: number;
    private teamBKills: number;

    private teamAPlayerStatistics: Map<number, TeamEliminationPlayerStatistic>;
    private teamBPlayerStatistics: Map<number, TeamEliminationPlayerStatistic>;

    constructor(match: TeamEliminationMatch, teamAPlayers: number[], teamBPlayers: number[]) {
        this.match = match;

        this.teamAShots = 0;
        this.teamBShots = 0;

        this.teamAHits = 0;
        this.teamBHits = 0;

        this.teamAKills = 0;
        this.teamBKills = 0;

        this.teamAPlayerStatistics = new Map();
        this.teamBPlayerStatistics = new Map();

        for (const id of teamAPlayers) {
            this.teamAPlayerStatistics.set(id, new TeamEliminationPlayerStatistic());
        }

        for (const id of teamBPlayers) {
            this.teamBPlayerStatistics.set(id, new TeamEliminationPlayerStatistic());
        }
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.STATS_SHOT, this.onShot);
        EventHandler.addListener(this, EventHandler.Event.STATS_HIT, this.onHit);
        EventHandler.addListener(this, EventHandler.Event.STATS_KILL, this.onKill);
        EventHandler.addListener(this, EventHandler.Event.STATS_SEND, this.onSend);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.STATS_SHOT, this.onShot);
        EventHandler.removeListener(this, EventHandler.Event.STATS_HIT, this.onHit);
        EventHandler.removeListener(this, EventHandler.Event.STATS_KILL, this.onKill);
        EventHandler.removeListener(this, EventHandler.Event.STATS_SEND, this.onSend);

        this.teamAPlayerStatistics.clear();
        this.teamBPlayerStatistics.clear();
    }

    private onSend(data: any) {
        if (data.match === this.match) {

            // The playerId is the id of the last player killed.
            const teamALost = this.teamAPlayerStatistics.has(data.playerId);
            const teamBLost = this.teamBPlayerStatistics.has(data.playerId);

            this.teamAPlayerStatistics.forEach((stat: TeamEliminationPlayerStatistic, id: number) => {
                const stats = stat.getStatistics(!teamALost, this.teamAShots, this.teamAHits, this.teamAKills, this.teamBShots, this.teamBHits, this.teamBKills);
                PacketSender.sendMatchStatistics(id, stats);
            });

            this.teamBPlayerStatistics.forEach((stat: TeamEliminationPlayerStatistic, id: number) => {
                const stats = stat.getStatistics(!teamBLost, this.teamBShots, this.teamBHits, this.teamBKills, this.teamAShots, this.teamAHits, this.teamAKills);
                PacketSender.sendMatchStatistics(id, stats);
            });
        }
    }

    private onShot(data: any) {
        if (data.match === this.match) {
            if (this.teamAPlayerStatistics.has(data.player)) {
                (this.teamAPlayerStatistics.get(data.player) as TeamEliminationPlayerStatistic).incrementShots();

                this.teamAShots ++;
            } else if (this.teamBPlayerStatistics.has(data.player)) {
                (this.teamBPlayerStatistics.get(data.player) as TeamEliminationPlayerStatistic).incrementShots();

                this.teamBShots ++;
            } else {
                console.warn("No stats registered for shot");
            }
        }
    }

    private onHit(data: any) {
        if (data.match === this.match) {
            if (this.teamAPlayerStatistics.has(data.player)) {
                (this.teamAPlayerStatistics.get(data.player) as TeamEliminationPlayerStatistic).incrementHits();

                this.teamAHits ++;
            } else if (this.teamBPlayerStatistics.has(data.player)) {
                (this.teamBPlayerStatistics.get(data.player) as TeamEliminationPlayerStatistic).incrementHits();

                this.teamBHits ++;
            } else {
                console.warn("No stats registered for hit");
            }
        }
    }

    private onKill(data: any) {
        // shooter is not guaranteed.
        if (data.match === this.match) {
            if (this.teamAPlayerStatistics.has(data.player)) {
                (this.teamAPlayerStatistics.get(data.player) as TeamEliminationPlayerStatistic).incrementDeaths();

                if (this.teamBPlayerStatistics.has(data.shooter)) {
                    (this.teamBPlayerStatistics.get(data.shooter) as TeamEliminationPlayerStatistic).incrementKills();

                    this.teamBKills ++;
                }
            } else if (this.teamBPlayerStatistics.has(data.player)) {
                (this.teamBPlayerStatistics.get(data.player) as TeamEliminationPlayerStatistic).incrementDeaths();

                if (this.teamAPlayerStatistics.has(data.shooter)) {
                    (this.teamAPlayerStatistics.get(data.shooter) as TeamEliminationPlayerStatistic).incrementKills();

                    this.teamAKills ++;
                }
            } else {
                console.log("No stats registered for death");
            }
        }
    }
}
