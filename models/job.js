const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");
const searchJobBy = require("../helpers/searchJobsBy");

class Job {
    constructor({title, salary, equity,company_handle,date_posted}) {
        this.title = title;
        this.salary = salary;
        this.equity = equity;
        this.companyHandle = company_handle;
        this.datePosted = date_posted;
        }
        get id() {
            return this._id;
        }
        set id(id) {
            if (this._id && this._id !== id)
                throw new Error("Cannot change job Id");
            this._id = id;
        }
    
        static async all(searchTerms) { 
            const query = searchJobBy(searchTerms);
            const result = await db.query(query);
            if (result.rows.length === 0) {
                throw { message: `There is no job with the given search keyword`, status: 404 }
            }
            return result.rows.map(c => new Job(c));
        }

        static async get(id){
            const result = await db.query(`SELECT title,salary,equity,company_handle,date_posted FROM jobs WHERE id=$1`, [id]);
            let job = result.rows[0];
            if(job === undefined){
                const err = new Error(`No such job: ${job}`);
                err.status = 404;
                throw err;
            }
            return new Job(job);
        }
        static async createJob(title,salary,equity,company_handle) {
            const result = await db.query(
                `INSERT INTO jobs (
                        title,
                        salary,
                        equity,
                        company_handle,
                        date_posted)
                    VALUES ($1, $2, $3, $4,current_timestamp)
                    RETURNING title,salary,equity,company_handle,date_posted`,
                [title,salary,equity,company_handle]);
                
            return result.rows[0];
            
        }
        
        static async updateJob(id, data) {
            const query = partialUpdate("jobs",data,"id", id);
            const result = await db.query(query);
            
        
            if (result.rows.length === 0) {
                throw { message: `There is no job with id '${id}`, status: 404 }
            }
        
            return result.rows[0];
        }

        static async delete(id) {
            const result = await db.query(
            `DELETE FROM jobs 
            WHERE id = $1 
            RETURNING id`,
            [id]);
    
        if (result.rows.length === 0) {
            throw { message: `There is no job title with id '${id}`, status: 404 }
        }
    }
}

module.exports = Job;