const EventEmitter = require("events");
const express = require("express");
const LosslessJSON = require("lossless-json");
const fs = require("fs");

class CSGOGSI extends EventEmitter {
  constructor() {
    super();
    this.app = express();

    this.app.post("/", (req, res) => {
      let body = "";
      req.on("data", (data) => {
        body += data;
      });

      req.on("end", () => {
        this.processJson(body);
      });

      res.send("Coolio");
    });

    this.app.listen(1349, () => {
      console.log("Gamestate Started");
    });
  }

  processJson(json) {
    try {
      let data = JSON.parse(json);
      let test = LosslessJSON.parse(json);
      try {
        data.bomb.player = test.bomb.player.value; //????
      } catch (error) {}
      this.emit("all", data);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = CSGOGSI;
