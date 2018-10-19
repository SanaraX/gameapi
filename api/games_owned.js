const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./gamecollection.db');

// Query functions
function queryGameOwnedById(id) {
    q = `SELECT games_owned.id, games.name, consoles.name AS console, games_owned.purchase_price,
    games_owned.market_price, games_owned.condition, games_owned.date 
    FROM games_owned 
    LEFT JOIN games ON games.id = games_owned.game_id
    LEFT JOIN consoles ON games.console_id = consoles.id 
    WHERE games_owned.id = ?`
    return new Promise(function(resolve, reject) {
        db.get(q, [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        });
    })
}
function queryAllGamesOwned() {
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
    return new Promise(function(resolve, reject) {
        db.all(query, (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}
function queryInsertGameOwned(payload) {
    query = `INSERT INTO games_owned 
    (game_id, condition, purchase_price, market_price, date) 
    VALUES ($game_id, $condition, $purchase_price, $market_price, $date)`
    return new Promise(function(resolve, reject) {
        db.run(query, payload, function(err) {
            if(err) reject (err)
            resolve(this.lastID)
        })
    })
}
function queryModifyGame(reqBody, args) {
    const whiteList = ['game_id', 'condition', 'purchase_price', 'market_price', 'date']
    let inject = ''
    let injectArray = []
    Object.keys(reqBody).forEach(field => {
        value = reqBody[field]
        if (!whiteList.includes(field)) return
        if (!value) return
        injectArray.push(`${field} = $${field}`)
        args['$' + field] = value
    })
    inject = injectArray.join(", ")
    query = `UPDATE games_owned SET ${inject} WHERE id = $id`
    return new Promise(function(resolve, reject) {
        if (inject === '') reject('Missing post params')
        db.run(query, args, (err) => {
            if (err) reject (err)
            resolve(args.$id)
        })
    })
}
function queryDeleteGame (args) {
    query = `DELETE FROM games_owned WHERE id = $id`
    return new Promise(function(resolve, reject) {
        db.run(query, args, (err) => {
            if (err) reject(err)
            resolve(args.$id)
        })
    })
}
// HTTP Functions
async function getGameOwned(req, res) {
    try {
        let row = await queryGameOwnedById(req.params.id)
        res.send(row)
    } catch (err) {
        res.send(err.message)
    }
}
async function getAllGamesOwned(req, res) {
    try {
        let rows = await queryAllGamesOwned()
        res.send(rows)
    } catch (err) {
        res.send(err.message)
    }
}
async function postGameOwned(req, res) {
    const args = {
        $game_id: req.body.game_id,
        $condition: req.body.condition,
        $purchase_price: req.body.purchase_price,
        $market_price: req.body.market_price,
        $date: req.body.date
    }
    try {
        let rowID = await queryInsertGameOwned(args)
        let row = await queryGameOwnedById(rowID)
        res.send(row)
    } catch (err) {
        res.send(err.message)
    }
}
async function deleteGameOwned(req, res) {
    const args = { $id: req.params.id }
    try {
        let rowID = await queryDeleteGame(args)
        res.send(`Game Owned ID: ${rowID} deleted`)
    } catch (err) {
        res.send(err.message)
    }
}
async function putGameOwned(req, res) {
    const args = { $id: req.params.id }
    const request = req.body;
    try {
        let rowID = await queryModifyGame(request, args)
        let row = await queryGameOwnedById(rowID)
        res.send(row)
    } catch (err) {
        res.send(err)
    } 
}

module.exports = {
    getGameOwned,
    getAllGamesOwned,
    postGameOwned,
    putGameOwned,
    deleteGameOwned
}