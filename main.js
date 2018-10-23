/*  Load app using express
    Game collecting app has webpage whose
    purpose is to interact with databases of 
    game data for users
    Operations include:
    Read, Write, Delete, and Update
    - Create new entries in all tables
    - Delete entries from your owned tables
    - Update your own table
    -- Ex.) When selecting a game no foreign key but actual name

    Lines to require express frameworks, ports and sqlite3 DB
    Don't have queries dont be too flexible
    PUT used to replace entire object
    PATCH used to replace part of an object

    Single Page Application on ./ (ROOT)

*/
const express = require('express')
const path = require("path")
const bodyParser = require('body-parser')
const consoles = require("./api/consoles")
const games = require("./api/games")
const consolesOwned = require("./api/consoles_owned")
const gamesOwned = require("./api/games_owned")
const app = express()
const port = 3004;
// !! Required to handle HTTP POST requests, extracts body portion of 
// incoming request and exposes it on req.body
app.use(bodyParser.json());                         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
// Root request everytime page is refreshed or loaded
// req/res are the functions executed when the route is matched

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/index.html'))
})
app.get('/api/games/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/games.html'))
})
// GAME OPERATIONS END POINTS
app.get("/game/", games.getAllGames);
app.post("/game/", games.postGame);
app.get('^/game/:id([0-9]+)', games.getGame);
app.put("^/game/:id([0-9]+)", games.putGame);
app.delete("^/game/:id([0-9]+)", games.deleteGame);
// CONSOLE OPERATIONS
app.get("^/console/:id([0-9]+)", consoles.getConsole);
app.get("/console/", consoles.getAllConsoles);
app.post("/console/", consoles.postConsole);
app.put("^/console/:id([0-9]+)", consoles.putConsole);
app.delete("^/console/:id([0-9]+)", consoles.deleteConsole);
// GAME OWNED OPERATIONS
app.get("/game/owned/", gamesOwned.getAllGamesOwned);
app.post("/game/owned", gamesOwned.postGameOwned);
app.get("^/game/owned/:id([0-9]+)", gamesOwned.getGameOwned)
app.put("^/game/owned/:id([0-9]+)", gamesOwned.putGameOwned)
app.delete("^/game/owned/:id([0-9]+)", gamesOwned.deleteGameOwned)
// CONSOLE OWNED OPERATIONS
app.get("/console/owned", consolesOwned.getAllConsolesOwned)
app.post("/console/owned", consolesOwned.postConsoleOwned)
app.get("^/console/owned/:id([0-9]+)", consolesOwned.getConsoleOwned)
app.put("^/console/owned/:id([0-9]+)", consolesOwned.putConsoleOwned)
app.delete("^/console/owned/:id([0-9]+)", consolesOwned.deleteConsoleOwned)
app.listen(port, () => {
    console.log(`Working thing on port ${port}`)
})

