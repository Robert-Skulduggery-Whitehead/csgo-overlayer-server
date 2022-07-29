var io = require("socket.io-client");
var socket = io.connect("http://DESKTOP-FCKJ1IR:3000");

socket.on("connect", (socket) => {
  console.log("Connected");
});
