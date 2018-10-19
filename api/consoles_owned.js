const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./gamecollection.db');

// Query Functions
function queryGetAllConsolesOwned() {
    query = `SELECT consoles_owned.id, consoles.name, consoles.release_date, consoles.brand, 
    consoles_owned.purchase_price, consoles_owned.market_price, consoles_owned.condition, consoles_owned.date 
    FROM consoles_owned 
    LEFT JOIN consoles ON consoles.id = consoles_owned.console_id`
    return new Promise(function (resolve, reject) {
        db.all(query, function (row, err) {
            if (err) reject(err)
            resolve(row)
        })
    })
}
function queryConsoleOwnedById(id) {
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
    return new Promise(function (resolve, reject) {
        db.get(query, [id], (err, data) => {
            if (err) reject(err)
            resolve(data)
        }
        )
    })
}
function queryPostConsole(payload) {
    query = `INSERT INTO consoles_owned 
    (console_id, purchase_price, market_price, condition, date) 
    VALUES ($console_id, $purchase_price, $market_price, $condition, $date)`
    return new Promise(function (resolve, reject) {
        db.run(query, payload, function (err) {
            if (err) reject(err)
            resolve(this.lastID)
        })
    })
}
function queryModifyConsole(reqBody, args) {
    const whiteList = ['console_id', 'purchase_price', 'market_price', 'condition', 'date']
    let injectArray = []
    let inject = ''
    Object.keys(reqBody).forEach(field => {
        value = reqBody[field]
        if (!whiteList.includes(field)) return
        if (!value) return
        injectArray.push(`${field} = $${field}`)
        args['$' + field] = value
    })
    inject = injectArray.join(', ')
    query = `UPDATE consoles_owned SET ${inject} WHERE id = $id`
    console.log(inject)
    return new Promise(function (resolve, reject) {
        if (inject == '') reject('Missing put parameters')
        db.run(query, args, function (err) {
            if (err) reject(err)
            resolve(args.$id)
        })
    })
}
function queryDeleteConsole(args) {
    query = "DELETE FROM consoles_owned WHERE id = $id"
    return new Promise(function (resolve, reject) {
        db.run(query, args, function (err) {
            if (err) reject(err)
            resolve(args.$id)
        })
    })
}
// HTTP Functions
async function getConsoleOwned(req, res) {
    try {
        let row = await queryConsoleOwnedById(req.params.id)
        res.send(row)
    } catch (err) {
        res.send(err.message)
    }
}
async function getAllConsolesOwned(req, res) {
    try {
        rows = await queryGetAllConsolesOwned()
        res.send(rows)
    }
    catch (err) {
        throw err
    }
}
async function postConsoleOwned(req, res) {
    const args = {
        $console_id: req.body.console_id,
        $purchase_price: req.body.purchase_price,
        $market_price: req.body.market_price,
        $condition: req.body.condition,
        $date: req.body.date
    }
    try {
        let rowID = await queryPostConsole(args)
        let data = await queryConsoleOwnedById(rowID)
        res.send(data)
    } catch (err) {
        res.send(err.message)
    }
}
async function deleteConsoleOwned(req, res) {
    const args = { $id: req.params.id }
    try {
        let rowID = queryDeleteConsole(args)
        res.send(`Console Owned ID: ${rowID} deleted`)
    } catch (err) {
        if (err) res.send(err.message)
    }
}
async function putConsoleOwned(req, res) {
    console.log('something3')
    const args = { $id: req.params.id }
    const request = req.body;
    try {
        console.log('something2')
        let rowID = await queryModifyConsole(request, args)
        console.log('something')
        let data = await queryConsoleOwnedById(rowID)
        res.send(data)
    } catch (err) {
        console.log(err)
        if (err) res.send(err.message)
    }
}
module.exports = {
    getConsoleOwned,
    getAllConsolesOwned,
    postConsoleOwned,
    putConsoleOwned,
    deleteConsoleOwned
};