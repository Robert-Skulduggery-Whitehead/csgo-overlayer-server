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
app.use(cors);

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
  socket.on("disconnect", () => {
    console.log("User disconnected");
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

gsi.on("all", (newData) => {
  //if (Object.keys(newData).includes("allplayers")) {
  //if (Object.keys(allplayers).length > 10) {
  //  allplayers = {};
  //}
  /*for (let player of Object.keys(data.allplayers)) {
      if (!Object.keys(players).includes(player)) {
        tempPlayer = db.getPlayer(player);
        if (tempPlayer) {
          players[player] = {
            image: tempPlayer.image,
            name: tempPlayer.name,
          };
          data.allplayers[player].name = tempPlayer.name;
          data.allplayer[player].image = tempPlayer.image;
        }
      }
    }*/
  //}
  //

  /*let playerKeys = Object.keys(newData.allplayers);
  for (key in playerKeys) {
    let index = playersArray.findIndex((player) => key === player.steamID); //??
    if (index === -1) {
      player = db.getPlayer(key);
    }
  }*/

  //data
  //add players from array, sides, teams, series, etc
  //console.log(data);

  if (Object.keys(newData).includes("allplayers")) {
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
        newData.allplayers[key].image = playersObject[key].image;
        //console.log(playersObject[key].image === "");
      }
    }
  }

  update(newData);
  let data = Object.assign(dataObject, newData);
  io.emit("gameStateData", data);
  io.emit("showHUD");
});

server.listen(3001, "127.0.0.1", () => {
  console.log("Listening on 3001");
});

//Client host through API .js, post and get and such

//Manual stuff like: rounds, etc

//db stuff, create arrays that gets sent over to frontend. allplayers array > 10, reset

/*Data Stuff
data: {
  playerState: {
    team: ct/t,
    teamInfo: {}, //Needed?
    bomb: false, //??
  }

  sides: {
    left: ct/t,
    right: ct/t,
  }
  teams: {
    left: {
      name:
      image:
      wins: 
    }
    right: {
      name:
      image:
      wins:
    }
  }
  //^^ turns into -->
  left: {
    name:
    image:
    wins:
    side: t/ct
  }
  right: {
    name:,
    image:
    wins:
    side: t/ct
  }

  //
  series: {
    bestOf: 1/3/5
    current: 1, 2, 3, 4, 5
  }
  games: {
    game1: {
      map:
      picked
      winner
      winnerScore
      loserScore
    }
    game2:...
  }

  //

}

*/

//functions
function update(newData) {
  updatePlayerState(newData);
  setSides(newData);
  roundSwap(newData);
}

function updatePlayerState(newData) {
  let player = newData.player;
  let bomb = newData.bomb;
  if (player.steamid === bomb.player) {
    dataObject.playerState.bomb = true;
  } else {
    dataObject.playerState.bomb = false;
  }

  if (player.steamid === 0 || player.steamid > 5) {
    team = dataObject.right.side;
    dataObject.playerState.teamInfo = {
      image: dataObject.right.image,
    };
  } else {
    team = dataObject.left.side;
    dataObject.playerState.teamInfo = {
      image: dataObject.left.image,
    };
  }
}

function setSides(newData) {
  let allplayers = newData.allplayers;
  let keys = Object.keys(allplayers);
  let player = keys.find((key) => allplayers[key].observer_slot === 1);
  if (allplayers[player].team === "CT") {
    dataObject.left.side = "ct";
    dataObject.right.side = "t";
  } else {
    dataObject.left.side = "t";
    dataObject.right.side = "ct";
  }
}

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
  let temp = dataObject.left;
  dataObject.left = dataObject.right;
  dataObject.right = temp;
  ch.sendData(dataObject);
}

function setSeriesInfo() {
  //from client
  /**
   *   setSeriesInfo(seriesInfo) {
    this.setState({
      series: {
        bestOf: seriesInfo[0],
        games: seriesInfo[1],
      },
    });
    let tempTeams = this.state.teams;
    let tempCurrent = 1;
    for (let game in this.state.games) {
      if (this.state.games[game].winner === this.state.teams.left.name) {
        tempTeams.left.wins = tempTeams.left.wins + 1;
        tempCurrent++;
      } else if (
        this.state.games[game].winner === this.state.teams.right.name
      ) {
        tempTeams.right.wins = tempTeams.right.wins + 1;
        tempCurrent++;
      }
    }
    let tempSeries = this.state.series;
    tempSeries.current = tempCurrent;
    this.setState({
      teams: tempTeams,
      series: tempSeries,
    });
  }
   */
}
