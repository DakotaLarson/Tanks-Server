const Vector3 = require('./Vector3');

let initialSpawnLocations = [];
let gameSpawnLocations = [];

module.exports.update = (data) => {
    initialSpawnLocations.length = 0;
    gameSpawnLocations.length = 0;

    for(let i = 0; i < data.initialSpawnLocations.length; i += 3){
        let x = data.initialSpawnLocations[i * 3];
        let y = data.initialSpawnLocations[i * 3 + 1];
        let z = data.initialSpawnLocations[i * 3 + 2];
        initialSpawnLocations.push(new Vector3(x, y, z));
    }

    for(let i = 0; i < data.gameSpawnLocations.length; i += 3){
        let x = data.gameSpawnLocations[i * 3];
        let y = data.gameSpawnLocations[i * 3 + 1];
        let z = data.gameSpawnLocations[i * 3 + 2];
        gameSpawnLocations.push(new Vector3(x, y, z));
    }
};

module.exports.getRandomInitialSpawn = () => {
    let length = initialSpawnLocations.length;
    if(length){
        return initialSpawnLocations[Math.floor(Math.random() * length)]
    }else{
        return undefined;
    }
};