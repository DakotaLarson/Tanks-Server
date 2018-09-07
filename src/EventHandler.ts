const eventListeners = {};

export const Event = {
    //PLAYER
    PLAYER_JOIN: 0,
    PLAYER_LEAVE: 5,

    //WS
    WS_CONNECTION_CHECK: 1,
    WS_CONNECTION_UNRESPONSIVE: 2,
    WS_CONNECTION_CLOSED: 3,
    WS_CONNECTION_OPENED: 4,

    //ARENA LOADER
    ARENALOADER_ARENA_LOAD: 6,
    ARENALOADER_NO_ARENAS: 7,
};//Latest Event #: 7 (Update upon event addition!)

export const addListener = (event, callback) => {
    if(event in eventListeners){
        eventListeners[event].unshift(callback);
    }else{
        eventListeners[event] = [callback];
    }
};
export const addMonitorListener = (event, callback) => {
    if(event in eventListeners){
        eventListeners[event].push(callback);
    }else{
        eventListeners[event] = [callback];
    }
};
export const removeListener = (event, callback) => {
    if(event in eventListeners){
        let callbackIndex = eventListeners[event].indexOf(callback);
        if(callbackIndex > -1){
            eventListeners[event].splice(callbackIndex, 1);
        }
    }
};
export const callEvent = (event, argument?) => {
    if(event in eventListeners){
        let callbacks = eventListeners[event];
        for(let i = 0; i < callbacks.length; i ++){
            callbacks[i](argument);
        }
    }
};