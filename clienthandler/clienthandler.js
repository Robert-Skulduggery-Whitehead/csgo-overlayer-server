const EventEmitter = require("events");
const express = require("express");
const cors = require("cors");
const http = require("http");
const sio = require("socket.io");

class ClientHandler extends EventEmitter {
  constructor() {
    super();

    this.app = express();
    this.app.use(cors());

    this.server = http.createServer(this.app);

    this.io = sio(this.server, { cors: { origin: "*" } });

    this.io.on("connection", (socket) => {
      console.log("client connected");

      socket.on("disconnect", () => {
        console.log("client disconnected");
      });
    });

    //get local machine ip?
    this.server.listen(3005, "127.0.0.1", () => {
      console.log("Listening on ip:3001");
    });
  }
}

module.exports = ClientHandler;
