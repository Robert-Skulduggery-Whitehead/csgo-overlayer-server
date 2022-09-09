var express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const os = require("os");
const GameStateIntegration = require("./gamestate/gamestate");
const DataBaseHandler = require("./db/db");
const ClientHandler = require("./clienthandler/clienthandler");
const e = require("express");

var hostname = os.hostname();
//In app, give host name to connect other client machine to host

var app = express();
app.use(cors());

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

var dataObject = {
  playerState: {
    team: "ct",
    teamInfo: {},
    bomb: false,
  },
  left: {
    name: "bravado",
    image: "bravado.png",
    wins: 1,
    side: "t",
  },
  right: {
    name: "ekasi esports",
    image: "ekasi esports.png",
    wins: 1,
    side: "ct",
  },
  series: {
    bestOf: 3,
    current: 3,
  },
  allplayers: {},
  games: {
    game1: {
      map: "mirage",
      picked: "bravado",
      winner: "bravado",
      winnerScore: 16,
      loserScore: 7,
    },
    game2: {
      map: "dust",
      picked: "ekasi esports",
      winner: "ekasi esports",
      winnerScore: 16,
      loserScore: 7,
    },
    game3: {
      map: "inferno",
      picked: "decider",
      winner: "current",
      winnerScore: "",
      loserScore: "",
    },
  },
};

let playersObject = [];

io.on("connection", (socket) => {
  console.log("overlay connected");
  socket.on("disconnect", () => {
    console.log("overlay disconnected");
  });
});

var gsi = new GameStateIntegration();
var db = new DataBaseHandler();
var ch = new ClientHandler(dataObject);

ch.on("swapTeams", () => {
  swapTeams();
  console.log("Swapping Teams");
});

ch.on("games", (data) => {
  dataObject.games = data.games;
  dataObject.left.wins = 0;
  dataObject.right.wins = 0;
  for (var key of Object.keys(data.games)) {
    if (data.games[key].winner === dataObject.left.name) {
      dataObject.left.wins++;
    } else if (data.games[key].winner === dataObject.right.name) {
      dataObject.right.wins++;
    }
  }
  dataObject.series.bestOf = data.bestOf;
});

ch.on("teams", (teams) => {
  dataObject.left = teams.left;
  dataObject.right = teams.right;
  dataObject.left.image = teams.left.name + ".png";
  dataObject.right.image = teams.right.name + ".png";
  console.log(dataObject.left);
});

ch.on("player", (player) => {
  db.updatePlayer([player.id, player.name, player.name + ".png"]);
});

ch.on("showOverlay", () => {
  io.emit("showOverlay");
  console.log("show");
});

ch.on("hideOverlay", () => {
  io.emit("hideOverlay");
  console.log("hide");
});

ch.on("closeOverlay", () => {
  io.emit("closeOverlay");
  console.log("closed");
});

gsi.on("all", (newData) => {
  if (
    Object.keys(newData).includes("allplayers") &&
    Object.keys(newData).includes("allplayers")
  ) {
    update(newData);
  }

  if (
    Object.keys(newData).includes("allplayers") &&
    Object.keys(newData).includes("team_ct")
  ) {
    for (let key of Object.keys(newData.allplayers)) {
      let player = db.getPlayer(key);
      if (player !== undefined) {
        playersObject[player.id] = {
          name: player.name,
          image: player.image,
        };
      }
      if (Object.keys(playersObject).includes(key)) {
        newData.allplayers[key].name = playersObject[key].name;
        //newData.allplayers[key].image = playersObject[key].image;
        //console.log(playersObject[key].image === "");
      }
    }
    if (Object.keys(playersObject).includes(newData.player.steamid)) {
      newData.player.name = playersObject[newData.player.steamid].name;
      //newData.player.image = playersObject[newData.player.steamid].imge;
    }
  }

  //console.log(newData.map);
  let data = Object.assign(dataObject, newData);
  io.emit("gameStateData", data);
  io.emit("showHUD");
});

server.listen(3001, "127.0.0.1", () => {
  console.log("Listening on 3001");
});

//functions
function update(newData) {
  updatePlayerState(newData);
  setSides(newData);
  roundSwap(newData);
}

function updatePlayerState(newData) {
  let player = newData.player;
  let bomb = newData.bomb;
  if (bomb !== undefined) {
    if (player.steamid === bomb.player) {
      dataObject.playerState.bomb = true;
    } else {
      dataObject.playerState.bomb = false;
    }
  }

  if (player.observer_slot === 0 || player.observer_slot > 5) {
    dataObject.playerState.teamInfo = {
      image: dataObject.right.image,
    };
    dataObject.playerState.team = dataObject.right.side;
  } else {
    dataObject.playerState.teamInfo = {
      image: dataObject.left.image,
    };
    dataObject.playerState.team = dataObject.left.side;
  }
}

function setSides(newData) {
  let allplayers = newData.allplayers;
  let keys = Object.keys(allplayers);
  let player = keys.find((key) => allplayers[key].observer_slot === 1);
  if (allplayers[player] !== undefined) {
    if (allplayers[player].team === "CT") {
      dataObject.left.side = "ct";
      dataObject.right.side = "t";
    } else {
      dataObject.left.side = "t";
      dataObject.right.side = "ct";
    }
  }
}

//Fix this (previous data from gamestate?)
function roundSwap(newData) {
  let round = newData.round;
  let map = newData.map;
  if (round === 15 && map.round !== round) {
    this.swapTeams();
  }
  if (round === 30 && map.round !== round) {
    this.swapTeams();
  }
  if (round > 30) {
    if (round % 6 === 0 && round !== map.round) {
      this.swapTeams();
    }
  }
}

function swapTeams() {
  let left = dataObject.left.side;
  let right = dataObject.right.side;
  let temp = dataObject.left;
  dataObject.left = dataObject.right;
  dataObject.right = temp;
  dataObject.left.side = left;
  dataObject.right.side = right;
  ch.sendData(dataObject);
}
