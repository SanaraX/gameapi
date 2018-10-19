const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./gamecollection.db');

// FUNCTIONS FOR DATABASE HERE
// Query function for database
function queryConsoleById(id) {
    q = `SELECT * FROM consoles WHERE id = ?`
    return new Promise(function (resolve, reject) {
        db.get(q, [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}
function queryConsoleAll() {
    query = `SELECT * FROM consoles`
    return new Promise (function(resolve, reject) {
        db.all(query, (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        });
    })
}
function queryInsertConsole(payload) {
    q = `INSERT INTO consoles (name, release_date, brand) VALUES ($name, $release_date, $brand)`
    return new Promise(function(resolve, reject) {
        db.run(q, payload, function(err) {
            if (err) reject (err)
            resolve(this.lastID)
        })
    })
}
function queryModifyConsole(reqBody, args) {
    const whiteList = ['brand', 'name', 'release_date']
    let inject = ''
    Object.keys(reqBody).forEach(field => {
        value = reqBody[field]
        if (!whiteList.includes(field)) return
        if (!value) return
        if (inject == '') inject += `${field} = $${field}`
        inject += `, ${field} = $${field}`
        args['$' + field] = value
    })
    query = `UPDATE consoles SET ${inject} WHERE id = $id`
    return new Promise(function(resolve, reject) {
        db.run(query, args, function(err) {
            if (err) reject(err)
            resolve(args.$id)
        })
    })
}
function queryDeleteConsole(id) {
    let query = "DELETE FROM consoles WHERE id = ?"
    return new Promise(function(resolve, reject) {
        db.run(query, [id], function(err) {
            if(err) reject(err)
            resolve(id)
        })
    })
}
//HTTP FUNCTIONS
async function getConsole(req, res) {
    try {
        let row = await queryConsoleById(req.params.id)
        res.send(row)
    } catch (err) {
        res.send(err.message)
    }
}
async function getAllConsoles(req, res) {
    try {
        let rows = await queryConsoleAll()
        res.send(rows)
    } catch (err) {
        res.send(err.message)
    }
}
async function postConsole(req, res) {
    const args = { $name: req.body.name, $release_date: req.body.release_date, $brand: req.body.brand }
    try {
        let rowID = await queryInsertConsole(args)
        let data = await queryConsoleById(rowID)
        res.send(data)
    } catch (err) {
        res.send(err.message)
    }
}
async function putConsole(req, res) {
    const args = { $id: req.params.id }
    const request = req.body;
    try {
        let put = await queryModifyConsole(request, args)
        let row = await queryConsoleById(put)
        res.send(row)
    } catch (err) {
        res.send(err.message)
    }
}
async function deleteConsole(req, res) {
    try {
        let remove = await queryDeleteConsole(req.params.id)
        res.send(`Row ${remove} console deleted`)
    } catch (err) {
        if (err) res.send(err.message)
    }
}

module.exports = {
    getConsole,
    getAllConsoles,
    postConsole,
    putConsole,
    deleteConsole
};