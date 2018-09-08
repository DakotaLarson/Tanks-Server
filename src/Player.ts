import * as PacketSender from './PacketSender';
import Vector3 from './Vector3';

export default class Player {

    name: string;
    id: number;
    pos: Vector3;
    bodyRot: number;
    headRot: number;

    constructor(name, id){
        this.name = name;
        this.id = id;
        this.pos = new Vector3();
        this.bodyRot = 0;
        this.headRot = 0;
    }

    sendArena(arena){
        PacketSender.sendArena(this.id, arena);
    }

    sendGameStatus(status: number){
        PacketSender.sendGameStatus(this.id, status);
    }

    sendAlert(message: string){
        PacketSender.sendAlert(this.id, message);
    }

    sendAssignedInitialSpawn(pos: Vector3){
        this.pos.x = pos.x;
        this.pos.y = pos.y;
        this.pos.z = pos.z;

        PacketSender.sendAssignedInitialSpawn(this.id, pos);
    }

    sendConnectedPlayerInitialSpawn(playerId: number, name: string, pos: Vector3, headRot: number, bodyRot: number){
        PacketSender.sendConnectedPlayerInitialSpawn(this.id, {
            id: playerId,
            name: name,
            pos: [pos.x, pos.y, pos.z],
            headRot: headRot,
            bodyRot: bodyRot
        });
    }
    
    sendConnectedPlayerPositionUpdate(pos: Vector3, bodyRot: number, headRot: number, playerId: number){
        PacketSender.sendConnectedPlayerPositionUpdate(this.id, pos, bodyRot, headRot, playerId);
    }

    handlePositionUpdate(data: Array<number>){
        this.pos.x = data[0];
        this.pos.y = data[1];
        this.pos.z = data[2];
        this.bodyRot = data[3];
        this.headRot = data[4];
    }
}
