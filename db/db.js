const sql = require("sqlite3").verbose();

class DataBaseHandler {
  constructor() {
    let db = new sql.Database("hud.db", (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Connected to database");
    });

    db.run(
      "CREATE TABLE IF NOT EXISTS players(steamID text primary key not null, playerName text default '', playerImage text default '')",
      (err) => {
        if (err) {
          return console.error(err.message);
        }
      }
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS teams(id int primary key not null, teamName text, teamLogo text)",
      (err) => {
        if (err) {
          return console.error(err.message);
        }
      }
    );

    let playerSQL =
      "SELECT playerName, playerImage FROM players WHERE steamID = ?";
  }

  getPlayer(steamID) {
    let playerName;
    let playerImage;
    let player = {};

    db.get(playerSQL, [steamID], (err, row) => {
      if (err) {
        return console.error(err);
      }
      if (row !== undefined) {
        playerName = row.playerName;
        playerImage = row.playerImage;
        player = { name: playerName, image: playerImage };
      } else {
        player = undefined;
      }

      return player;
    });
  }

  updatePlayer(player) {
    //player = steamID, playername, playerimage??? (array or object?)
    playerExistsSQL =
      "SELECT playerName FROM players WHERE steamID = '" + player[0] + "'"; //player[0] = players steam ID
    playerAddSQL =
      "INSERT INTO players (steamID, playerName, playerImage) VALUES ('" +
      data[0] +
      "', '" +
      data[1] +
      "', '')";
    playerUpdateSQL =
      "UPDATE players SET playerName = '" +
      data[1] +
      "' WHERE steamID = '" +
      data[0] +
      "'";
    db.get(playerExistsSQL, [], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row === undefined) {
        db.run(playerAddSQL, (err) => {
          if (err) {
            return console.error(err.message);
          }
        });
      } else {
        db.run(playerUpdateSQL, (err) => {
          if (err) {
            return console.error(err.message);
          }
        });
      }
    });
  }
}

module.exports = DataBaseHandler;
