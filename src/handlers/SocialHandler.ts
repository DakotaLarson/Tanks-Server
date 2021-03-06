import DatabaseHandler from "../database/DatabaseHandler";
import SocialDatabaseHandler from "../database/SocialDatabaseHandler";
import Auth from "../main/Auth";
import EventHandler from "../main/EventHandler";

export default class SocialHandler {

    private databaseHandler: DatabaseHandler;
    private socialDatabaseHandler: SocialDatabaseHandler;

    constructor(databaseHandler: DatabaseHandler, socialDatabaseHandler: SocialDatabaseHandler) {
        this.databaseHandler = databaseHandler;
        this.socialDatabaseHandler = socialDatabaseHandler;
    }

    public async handleFriendUpdate(token: string, username: string, action: boolean) {
        const data = await Auth.verifyId(token);
        const requestorId = data.id;
        const id = await this.databaseHandler.getPlayerId(username);
        const friendship = await this.socialDatabaseHandler.getFriendship(requestorId, id);

        if (action) {
            if (friendship.friends === 0) {
                // unblock friendship
                await this.socialDatabaseHandler.deleteFriendship(requestorId, id, true);
            } else if (friendship.friends === 2) {
                // create friendship
                await this.socialDatabaseHandler.createFriendship(requestorId, id);
                await this.sendNotification(true, requestorId, id);
            } else if (friendship.friends === 4) {
                // accept friendship (update)
                await this.socialDatabaseHandler.updateFriendship(id, requestorId, true);
                await this.socialDatabaseHandler.createConversation(requestorId, id);
                await this.sendNotification(false, requestorId, id);
            } else {
                throw new Error("400");
            }
        } else {
            if (friendship.negative === 1) {
                // block friendship
                await this.socialDatabaseHandler.blockFriendship(requestorId, id);
            } else if (friendship.negative === 2) {
                // cancel request (delete)
                await Promise.all([
                    this.socialDatabaseHandler.deleteFriendship(requestorId, id, true),
                    this.deleteNotification(requestorId, id),
                ]);

            } else if (friendship.negative === 3) {
                // delete request
                await this.socialDatabaseHandler.deleteFriendship(id, requestorId, true);
            } else if (friendship.negative === 4) {
                // unfriend (delete request)
                await this.socialDatabaseHandler.deleteFriendship(requestorId, id, false);
            } else {
                throw new Error("400");
            }
        }
        return await this.socialDatabaseHandler.getFriendship(requestorId, id);
    }

    public getFriendship(token: string, id: string) {
        return new Promise((resolve) => {
            Auth.verifyId(token).then((requestorData) => {
                if (requestorData.id !== id) {
                    this.socialDatabaseHandler.getFriendship(requestorData.id, id).then((friendship) => {
                        if (friendship) {
                            EventHandler.callEvent(EventHandler.Event.NOTIFICATION_DELETE_MULTIPLE, [
                                {
                                    type: "friend_request",
                                    sender: id,
                                    receiver: requestorData.id,
                                },
                                {
                                    type: "friend_accept",
                                    sender: id,
                                    receiver: requestorData.id,
                                },
                                {
                                    type: "referral",
                                    sender: id,
                                    receiver: requestorData.id,
                                },
                            ]);
                        } else {
                            EventHandler.callEvent(EventHandler.Event.NOTIFICATION_DELETE, {
                                type: "referral",
                                sender: id,
                                receiver: requestorData.id,
                            });
                        }
                        resolve(friendship);
                    }).catch((err) => {
                        console.error(err);
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    public handlePlayerOptions(body: any) {
        return new Promise((resolve, reject) => {
            Auth.verifyId(body.token).then((data: any) => {
                if ("friends" in body  || "conversations" in body) {
                    this.updatePlayerOptions(data.id, body.friends, body.conversations).then(() => {
                        resolve();
                    }).catch((code: number) => {
                        reject(code);
                    });
                } else {
                    this.getPlayerOptions(data.id).then((options: any) => {
                        resolve(options);
                    }).catch(() => {
                        reject(500);
                    });
                }
            }).catch(() => {
                reject(403);
            });
        });

    }

    private sendNotification(isRequest: boolean, sender: string, receiver: string) {
        this.databaseHandler.getPlayerUsername(sender).then((username) => {
            let message;
            if (isRequest) {
                message = "sent you a friend request!";
            } else {
                message = "accepted your friend request!";
            }
            const body = JSON.stringify({
                username,
                message,
            });
            EventHandler.callEvent(EventHandler.Event.NOTIFICATION_SEND, {
                type: isRequest ? "friend_request" : "friend_accept",
                sender,
                receiver,
                body,
            });
        }).catch((err) => {
            console.error(err);
        });
    }

    private deleteNotification(sender: string, receiver: string) {
        EventHandler.callEvent(EventHandler.Event.NOTIFICATION_DELETE, {
            type: "friend_request",
            sender,
            receiver,
        });
    }

    private getPlayerOptions(id: string) {
        return new Promise((resolve, reject) => {
            this.socialDatabaseHandler.getPlayerSocialOptions(id).then((rawResults: any) => {
                resolve({
                    friends: rawResults.friends ? true : false,
                    conversations: rawResults.conversations ? true : false,
                });
            }).catch((err) => {
                console.error(err);
                reject();
            });
        });
    }

    private updatePlayerOptions(id: string, friends: any, conversations: any) {
        return new Promise((resolve, reject) => {
            if (friends !== undefined || conversations !== undefined) {
                this.databaseHandler.updatePlayerSocialOptions(id, friends, conversations).then(() => {
                    resolve();
                }).catch((err) => {
                    console.error(err);
                    reject(500);
                });
            } else {
                resolve(400);
            }
        });
    }
}
