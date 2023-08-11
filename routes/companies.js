const express = require("express");
const app = require("../app");
let router = new express.Router();
const ExpressError = require('../expressError')
const db = require("../db");



router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot find users in table 'companies`, 404);
        }
        console.log("HERE I AM")
        return res.send({ "companies": results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    const { code } = req.params;
    try {
        const cResults = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        const iResults = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`, [code]);

        if (cResults.rows.length === 0) {
            throw new ExpressError(`Cannot find company with code ${code}`, 404);
        }

        const company = cResults.rows[0];
        const invoices = iResults.rows;

        company.invoices = invoices.map(inv => inv.id);

        return res.status(200).json({ "company": company });
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({ "company": { code, name, description } });
    } catch (e) {
        return next(e);
    }
})

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot find company with code ${code}`, 404);
        } else {
            return res.status(200).json({ "company": code, name, description })
        };
    } catch (e) {
        return next(e);
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code`, [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot find company with code ${code}`, 404)
        } else {
            return res.json({ "status": "deleted" });
        }
    } catch (e) {
        return next(e);
    }
});

module.exports = router;