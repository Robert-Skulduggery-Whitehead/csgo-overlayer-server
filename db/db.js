const sql = require("sqlite3").verbose();

class DataBaseHandler {
  constructor() {
    this.player = {};
    this.db = new sql.Database("./db/hud.db", (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Connected to database");
    });

    this.db.run(
      "CREATE TABLE IF NOT EXISTS players(steamID text primary key not null, playerName text default '', playerImage text default '')",
      (err) => {
        if (err) {
          return console.error(err.message);
        }
      }
    );
    this.db.run(
      "CREATE TABLE IF NOT EXISTS teams(id int primary key not null, teamName text, teamLogo text)",
      (err) => {
        if (err) {
          return console.error(err.message);
        }
      }
    );
  }

  getPlayer(steamID) {
    let playerSQL =
      "SELECT playerName, playerImage FROM players WHERE steamID = ?";

    this.db.get(playerSQL, [steamID], (err, row) => {
      if (err) {
        return console.error(err);
      }
      if (row !== undefined) {
        let playerName = row.playerName;
        let playerImage = row.playerImage;
        this.player = { id: steamID, name: playerName, image: playerImage };
      } else {
        this.player = undefined;
      }
      //console.log(player);
    });
    //console.log(player);
    return this.player;
  }

  updatePlayer(player) {
    //player = steamID, playername, playerimage??? (array or object?)
    let playerExistsSQL =
      "SELECT playerName FROM players WHERE steamID = '" + player[0] + "'"; //player[0] = players steam ID
    let playerAddSQL =
      "INSERT INTO players (steamID, playerName, playerImage) VALUES ('" +
      player[0] +
      "', '" +
      player[1] +
      "', '')";
    let playerUpdateSQL =
      "UPDATE players SET playerName = '" +
      player[1] +
      "' WHERE steamID = '" +
      player[0] +
      "'";
    this.db.get(playerExistsSQL, [], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row === undefined) {
        this.db.run(playerAddSQL, (err) => {
          if (err) {
            return console.error(err.message);
          } else {
            console.log("Player added");
          }
        });
      } else {
        this.db.run(playerUpdateSQL, (err) => {
          if (err) {
            return console.error(err.message);
          } else {
            console.log("Player updated");
          }
        });
      }
    });
  }
}

module.exports = DataBaseHandler;
