const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./gamecollection.db');

function queryGameOwnedById(id, callback) {
    q = `SELECT games_owned.id, games.name, consoles.name AS console, games_owned.purchase_price,
    games_owned.market_price, games_owned.condition, games_owned.date 
    FROM games_owned 
    LEFT JOIN games ON games.id = games_owned.game_id
    LEFT JOIN consoles ON games.console_id = consoles.id 
    WHERE games_owned.id = ?`
    db.get(q, [id], callback);
}
function queryAllGamesOwned(callback) {
    let query = `SELECT
    games_owned.id,
    games.name,
    consoles.name AS console,
    games_owned.purchase_price, 
    games_owned.market_price, 
    games_owned.condition, 
    games_owned.date 
    FROM games_owned 
    LEFT JOIN games ON games.id = games_owned.game_id
    LEFT JOIN consoles ON games.console_id = consoles.id`
    db.all(query, callback)
}
function queryInsertGameOwned(payload, callback) {
    query = `INSERT INTO games_owned 
    (game_id, condition, purchase_price, market_price, date) 
    VALUES ($game_id, $condition, $purchase_price, $market_price, $date)`
    db.run(query, payload, callback)
}
function queryModifyGame(reqBody, args, callback) {
    const whiteList = ['game_id', 'condition', 'purchase_price', 'market_price', 'date']
    let inject = ''
    Object.keys(reqBody).forEach(field => {
        value = reqBody[field]
        if (!whiteList.includes(field)) return
        if (!value) return
        inject += `${field} = $${field}`
        args['$' + field] = value
    })
    if (inject === '') res.send('missing post params')
    query = `UPDATE games_owned SET ${inject} WHERE id = $id`
    db.run(query, args, callback)
}
function queryDeleteGame (args, callback) {
    query = `DELETE FROM games_owned WHERE id = $id`
    db.run(query, args, callback)
}
// HTTP Functions
function getGameOwned(req, res) {
    queryGameOwnedById(req.params.id, (err, row) => {
        if (err) throw err
        if (!row) res.send({ err: 'no entries found' })
        res.send(row)
    })
}
function getAllGamesOwned(req, res) {
    queryAllGamesOwned((err, row) => {
        if (err) throw err
        if (!row) res.send({ err: 'no entries found' })
        res.send(row)
    });
}
function postGameOwned(req, res) {
    const args = {
        $game_id: req.body.game_id,
        $condition: req.body.condition,
        $purchase_price: req.body.purchase_price,
        $market_price: req.body.market_price,
        $date: req.body.date
    }
    queryInsertGameOwned(args, function (err) {
        if(err) throw err
        queryGameOwnedById(this.lastID, (err, row) => {
            if(err) throw err
            if(!row) res.send({ err: 'Unable to insert the game' })
            res.send(row)
        })
    })
}
function deleteGameOwned(req, res) {
    const args = { $id: req.params.id }
    queryDeleteGame(args, function (err) {
        if(err) throw err
        res.send('Entry deleted!')
    })
}
function putGameOwned(req, res) {
    const args = { $id: req.params.id }
    const request = req.body;
    queryModifyGame(request, args, function (err) {
        if (err) throw err
        queryGameOwnedById(req.params.id, (err, row) => {
            if (err) throw err
            if(!row) res.send({ err: "Unable to modify game"})
            res.send(row)
        }) 
    }) 
}

module.exports = {
    getGameOwned,
    getAllGamesOwned,
    postGameOwned,
    putGameOwned,
    deleteGameOwned
}




// return new Promise((resolve, reject) => {
//     db.get(q, [id], (err, row) => {
//         if (err) reject(err)
//         resolve(row)
//     })
// })
// .then(row => res.send(row))
// .catch(err => { throw err })