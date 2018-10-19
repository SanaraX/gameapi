const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./gamecollection.db');

// QUERY FUNCTIONS
/* Takes in id parameter and runs a select query using
a db.get function*/
function queryGameById(id) {
    q = `SELECT  
            games.id,
            games.name AS game_name, 
            games.release_date, 
            games.genre, 
            consoles.name
        FROM games
        LEFT JOIN consoles
        ON games.console_id = consoles.id
        WHERE games.id = ?`
    return new Promise(function (resolve, reject) {
        db.get(q, [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}
// GET ALL
function queryGameAll() {
    query = `SELECT * FROM games`
    return new Promise(function (resolve, reject) {
        db.all(query, (err, rows) => {
            if (err) reject (err)
            resolve(rows)
        });
    })
}
/* Takes in payload which is values being inserted 
and runs insert query using a db.run function*/
function queryInsertGame(payload) {
    q = `INSERT INTO games (name, console_id, release_date, genre) 
        VALUES ($name, $console_id, $release_date, $genre)`
    return new Promise(function (resolve, reject) {
        db.run(q, payload, function (err) {
            if (err) reject(err)
            resolve(this.lastID)
        })
    })
}
/* Takes in the request body information and the id argument to
run db.run function*/
function queryModifyGame(reqBody, args) {
    const whiteList = ['name', 'console_id', 'release_date', 'genre']
    let inject = ''
    Object.keys(reqBody).forEach(field => {
        value = reqBody[field]
        if (!whiteList.includes(field)) return
        if (!value) return
        if (inject == '') inject += `${field} = $${field}`
        inject += `, ${field} = $${field}`
        args['$' + field] = value
    })
    if (inject === '') res.send('missing post params')
    query = `UPDATE games SET ${inject} WHERE id = $id`
    return new Promise (function(resolve, reject) {
        db.run(query, args, function(err) {
            if (err) reject(err)
            resolve(args.$id)
        })
    })
}
function queryDeleteGame(id) {
    let query = "DELETE FROM games WHERE id = ?"
    return new Promise (function(resolve, reject) {
        db.run(query, [id], function(err) {
            if (err) reject (err)
            resolve (id)
        })
    })
}
//HTTP FUNCTIONS
async function getGame(req, res) {
    try {
        let row = await queryGameById(req.params.id)
        res.send(row)
    } catch (err) {
        res.send(err.message)
    }
}
async function getAllGames(req, res) {
    try {
        let rows = await queryGameAll()
        res.send(rows)
    } catch (err) {
        throw err
    }
}
async function postGame(req, res) {
    const args = {
        $name: req.body.name,
        $console_id: req.body.console_id,
        $release_date: req.body.release_date,
        $genre: req.body.genre
    }
    try {
        let rowID = await queryInsertGame(args)
        let data = await queryGameById(rowID)
        res.send(data)
    } catch (err) {
        res.send(err.message)
    }
}
async function putGame(req, res) {
    const args = { $id: req.params.id }
    const request = req.body;
    try {
        let put = await queryModifyGame(request, args)
        let row = await queryGameById(put)
        res.send(row)
    } catch (err) {
        res.send(err)
    }
}
async function deleteGame(req, res) {
    try {
        let rowID = await queryDeleteGame(req.params.id)
        res.send(`Game ID: ${rowID} deleted`)
    } catch (err) {
        res.send(err.message)
    }
}

// // OPERATION FOR THE GAMES TABLE
module.exports = {
    getGame,
    getAllGames,
    postGame,
    putGame,
    deleteGame
};