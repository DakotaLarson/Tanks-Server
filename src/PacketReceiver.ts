import EventHandler from "./EventHandler";
import Player from "./Player";

const receivePlayerMove = (player: Player, data: number[]) => {
    player.onMove(data);
    EventHandler.callEvent(EventHandler.Event.PLAYER_MOVE, player);
};

const receivePlayerShoot = (player: Player) => {
    player.shoot();
};

const receiveReloadMoveToggleRequest = (player: Player, data: number) => {
    let moving = false;
    if (data) {
        moving = true;
    }

    player.onReloadMoveToggle(moving);
};

const receiveReloadRequest = (player: Player) => {
    player.reload();
};

const receiveChatMessage = (player: Player, message: string) => {
    if (message.length <= 255) {
        EventHandler.callEvent(EventHandler.Event.CHAT_MESSAGE, {
            player,
            message,
        });
    }
};

const handlers: any = [
    receivePlayerMove,
    receivePlayerShoot,
    receiveReloadRequest,
    receiveReloadMoveToggleRequest,
    receiveChatMessage,
];

enum DataType {
    NUMBER,
    STRING,
    NUMBER_ARRAY,
    HEADER_ONLY,
}

export default class PacketReceiver {
    public static handleMessage(message: Buffer, player: Player) {
        const headerArr = Buffer.from(message.slice(0, 2));
        const header = headerArr.readUInt8(0);
        const dataType = headerArr.readUInt8(1);
        let body: any;
        switch (dataType) {
            case DataType.NUMBER:
                body = message.readFloatLE(4);
                break;
            case DataType.STRING:
                body = message.toString("utf8", 2);
                break;
            case DataType.NUMBER_ARRAY:
                body = new Array();
                for (let i = 4; i < message.length; i += 4) {
                    body.push(message.readFloatLE(i));
                }
                break;
            case DataType.HEADER_ONLY:
                body = new Array();
                break;
        }
        // subtraction because of the connection header which has a value of 0
        const handler = handlers[header - 1];
        if (handler) {
            handler(player, body);
        } else {
            console.warn("Received unknown header: " + header);
        }
    }
}
