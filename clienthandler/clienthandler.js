const EventEmitter = require("events");
const express = require("express");
const cors = require("cors");
const http = require("http");
const sio = require("socket.io");

class ClientHandler extends EventEmitter {
  constructor(data) {
    super(data);

    this.app = express();
    this.app.use(cors());

    this.server = http.createServer(this.app);

    this.io = sio(this.server, { cors: { origin: "*" } });

    this.io.on("connection", (socket) => {
      socket.emit("data", data);
      console.log("client connected");

      socket.on("swapTeams", () => {
        this.emit("swapTeams");
      });

      socket.on("getGames", (data) => {
        this.emit("games", data);
      });

      socket.on("getTeams", (teams) => {
        this.emit("teams", teams);
      });

      socket.on("getPlayer", (player) => {
        this.emit("player", player);
      });

      socket.on("disconnect", () => {
        console.log("client disconnected");
      });
    });

    //get local machine ip?
    this.server.listen(3005, "127.0.0.1", () => {
      console.log("Listening on ip:3001");
    });
  }

  sendData = (data) => {
    this.io.sockets.emit("data", data);
  };
}

module.exports = ClientHandler;
