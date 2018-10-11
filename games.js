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
    return new Promise(function(resolve, reject) {
        db.get(q, [id], (err, row) => {
            if (err) reject (err)
            resolve(row)
        })
    })
}
// GET ALL
function queryGameAll () {
    query = `SELECT * FROM games`
    return new Promise(function(resolve, reject) {
        db.all(query, (err) => {
            
        });
    })
}
/* Takes in payload which is values being inserted 
and runs insert query using a db.run function*/
function queryInsertGame(payload, callback) {
    q = `INSERT INTO games 
        (name, console_id, release_date, genre) 
        VALUES ($name, $console_id, $release_date, $genre)`
    db.run(q, payload, callback)
}
/* Takes in the request body information and the id argument to
run db.run function*/
function queryModifyGame(reqBody, args, callback) {
    const whiteList = ['name', 'console_id', 'release_date', 'genre']
    let inject = ''
    Object.keys(reqBody).forEach(field => {
        value = reqBody[field]
        if (!whiteList.includes(field)) return
        if (!value) return
        inject += `${field} = $${field}`
        args['$' + field] = value
    })
    if (inject === '') res.send('missing post params')
    query = `UPDATE games SET ${inject} WHERE id = $id`
    db.run(query, args, callback)
}
function queryDeleteGame(id, callback) {
    let query = "DELETE FROM games WHERE id = ?"
    db.run(query, [id], callback)
}
//HTTP FUNCTIONS
function getGame(req, res) {
    queryGameById(req.params.id)
    .then( (row) => { res.send(row) })
    .catch( (err) => {res.send(err)} )
}
function getAllGames(req, res) {
    queryGameAll((err, row)  => {
        if (err) throw err
        if (!row) res.send({ err: 'no entries found' })
        res.send(row)
    });
}
function postGame(req, res) {
    const args = {
        $name: req.body.name,
        $console_id: req.body.console_id,
        $release_date: req.body.release_date,
        $genre: req.body.genre
    }
    queryInsertGame(args, function (err) {
        if (err) throw err
        queryGameById(this.lastID, (err, row) => {
            if (err) throw err
            if (!row) res.send({ err: 'unable to insert the game' })
            res.send(row)
        })
    })
}
function putGame(req, res) {
    const args = { $id: req.params.id }
    const request = req.body;
    queryModifyGame(request, args, function (err) {
        if (err) throw err
        queryGameById(req.params.id, (err, row) => {
            if (err) throw err
            if (!row) res.send({ err: 'unable to modify the game' })
            res.send(row)
        })
    })
}
function deleteGame (req, res) {
    queryDeleteGame(req.params.id, function (err) {
        if (err) throw err
        res.send('Entry deleted!')
    }) 
}

// // OPERATION FOR THE GAMES TABLE
module.exports = {
    getGame,
    getAllGames,
    postGame,
    putGame,
    deleteGame
};