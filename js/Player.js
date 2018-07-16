 const EventHandler = require('./EventHandler');

module.exports = class Player {

    constructor(ws){
        this.ws = ws;
    }

    enable(){
        EventHandler.addListener(EventHandler.Event.WS_CONNECTION_CHECK, this.checkConnection);

        this.ws.on('message', (message) => {
            this.handleMessage(message);
        });
        this.ws.on('close', (code, reason) => {
            this.handleClose(code, reason);
        });
        this.ws.on('error', (error) => {
            this.handleError(error);
        });
        this.ws.isAlive = true;
        this.ws.on('pong', () => {
            this.ws.isAlive = true;
        });
    };

    disable(){
        EventHandler.removeListener(EventHandler.Event.WS_CONNECTION_CHECK, this.checkConnection);
        this.ws.terminate();
    }

    handleMessage(message){
        if(message instanceof Buffer){
            console.log(message);
        }else{
            console.log('received ' + message);
        }
    };

    handleClose(code, reason){
        console.log('WS Closed: ' + code + ' ' + reason);
        EventHandler.callEvent(EventHandler.Event.WS_CONNECTION_CLOSED, this);
    };

    handleError(error){
        console.log(error);
    };

    checkConnection(){
        if(!this.ws.isAlive){
            EventHandler.callEvent(EventHandler.Event.WS_CONNECTION_UNRESPONSIVE, this);
        }else{
            this.ws.isAlive = false;
            this.ws.ping();
        }
    };
};
