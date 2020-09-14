const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");
const searchCompanyBy = require("../helpers/searchCompanyBy");
class Company {
    constructor({handle, name, num_employees, description, logo_url}) {
        this.handle = handle;
        this.name = name;
        this.numEmployees = num_employees;
        this.description = description;
        this.logo_url = logo_url;
    }

    get num_employees() {
        return this._numEmployees;
    }
    
    set num_employees(val){
        if(val < 1) throw new Error("Cannot have fewer than 1 employee");
        this._numEmployees = val;
    }

    get companyHandle() {
        return this._handle;
    }
    set companyHandle(nameAbbr) {
        if (this._handle && this._handle !== nameAbbr)
            throw new Error("Cannot change company handle");
        this._handle = nameAbbr;
    }
    
    static async getAll(qryData) {
        const query = searchCompanyBy(qryData);
        const results = await db.query(query);
        if (results.rows.length === 0) {
            throw { message: `There is no company within the search criteria`, status: 404 }
        }
        return results.rows.map(c => new Company(c));
    }
    
    static async get(handle){
        const result = await db.query(`SELECT handle, name,num_employees, description, logo_url FROM companies WHERE handle=$1`, [handle])
        let company = result.rows[0];
        if(company === undefined){
            const err = new Error(`No such company: ${handle}`);
            err.status = 404;
            throw err;
        }
        return new Company(company);
    }
    
    static async create(handle,name,num_employees,description,logo_url) {
        const result = await db.query(
            `INSERT INTO companies (
                handle,
                name,
                num_employees,
                description,
                logo_url)
                VALUES ($1, $2, $3, $4,$5)
                RETURNING handle, name, num_employees,description, logo_url`,
            [handle,name,num_employees,description,logo_url]);
        
        return result.rows[0];
    }

    static async update(handle, data) {
        const { query, values } = partialUpdate("companies",data,"handle", handle);
        const result = await db.query(query, values);
    
        if (result.rows.length === 0) {
            throw { message: `There is no company with handle '${handle}`, status: 404 }
        }
    
        return result.rows[0];
    }

    static async delete(handle) {
        const result = await db.query(
            `DELETE FROM companies 
            WHERE handle = $1 
            RETURNING handle`,
            [handle]);
    
        if (result.rows.length === 0) {
            throw { message: `There is no company with handle '${handle}`, status: 404 }
        }
    }
}

module.exports = Company;