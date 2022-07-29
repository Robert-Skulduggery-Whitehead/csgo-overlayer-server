const sql = require("sqlite3").verbose();

class DataBaseHandler {
  constructor() {
    let db = new sql.Database(".hud.db", (err) => {
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

  updatePlayer() {}
}

module.exports = DataBaseHandler;
