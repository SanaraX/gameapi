const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./gamecollection.db');

// Query Functions
function queryGetAllConsolesOwned(callback) {
    query = `SELECT consoles_owned.id, consoles.name, consoles.release_date, consoles.brand, 
    consoles_owned.purchase_price, consoles_owned.market_price, consoles_owned.condition, consoles_owned.date 
    FROM consoles_owned 
    LEFT JOIN consoles ON consoles.id = consoles_owned.console_id`
    db.all(query, callback)
}
function queryConsoleOwnedById(id, callback) {
    query = `SELECT
    consoles_owned.id, 
    consoles.name, 
    consoles.release_date, 
    consoles.brand, 
    consoles_owned.purchase_price, 
    consoles_owned.market_price, 
    consoles_owned.condition, 
    consoles_owned.date 
    FROM consoles_owned 
    LEFT JOIN consoles ON consoles.id = consoles_owned.console_id 
    WHERE consoles_owned.id = ?`
    db.get(query, [id], callback)
}
function queryPostConsole(payload, callback) {
    query = `INSERT INTO consoles_owned 
        (console_id, purchase_price, market_price, condition, date) 
        VALUES ($console_id, $purchase_price, $market_price, $condition, $date)`
    db.run(query, payload, callback)
}
function queryModifyConsole(reqBody, args, callback) {
    const whiteList = ['console_id', 'purchase_price', 'market_price', 'condition', 'date']
    let inject = ''
    console.log(reqBody)
    Object.keys(reqBody).forEach(field => {
        value = reqBody[field]
        if (!whiteList.includes(field)) return
        if (!value) return
        inject += `${field} = $${field}`
        args['$' + field] = value
    })
    if (inject === '') res.send('missing post params')
    query = `UPDATE consoles_owned SET ${inject} WHERE id = $id`
    db.run(query, args, callback)
}
function queryDeleteConsole (args, callback) {
    query = "DELETE FROM consoles_owned WHERE id = $id"
    db.run(query, args, callback)
}
// HTTP Functions
function getConsoleOwned(req, res) {
    queryGetConsoleOwned(req.params.id, (err, row) => {
        if(err) throw err
        if(!row) res.send({err: 'No entries!'})
        res.send(row)
    });
}
function getAllConsolesOwned(req, res) {
    queryGetAllConsolesOwned((err, row) => {
        if (err) throw err
        if (!row) res.send({ err: 'No entries!' })
        res.send(row)
    });
}
function postConsoleOwned(req, res) {
    const args = {
        $console_id: req.body.console_id,
        $purchase_price: req.body.purchase_price,
        $market_price: req.body.market_price,
        $condition: req.body.condition,
        $date: req.body.date
    }
    queryPostConsole(args, function (err) {
        if (err) throw err
        queryGetConsoleOwned(this.lastID, (err, row) => {
            if(err) throw err
            if(!row) res.send({ err: 'Unable to insert the game' })
            res.send(row)
        })
    })
}
function deleteConsoleOwned(req, res) {
    const args = { $id: req.params.id }
    queryDeleteConsole(args, function (err) {
        if (err) throw err
        res.send('Row deleted!')
    })
}
function putConsoleOwned(req, res) {
    const args = { $id: req.params.id }
    const request = req.body;
    queryModifyConsole(request, args, function (err) {
        if (err) throw err
        queryConsoleOwnedById(req.params.id, (err, row) => {
            if (err) throw err
            if(!row) res.send({ err: "Unable to modify game"})
            res.send(row)
        }) 
    })
}

module.exports = {
    getConsoleOwned,
    getAllConsolesOwned,
    postConsoleOwned,
    putConsoleOwned,
    deleteConsoleOwned
};