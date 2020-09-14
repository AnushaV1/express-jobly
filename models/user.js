const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

class User {

    constructor({username,first_name,last_name,email,photo_url}) {
    
        this.username = username;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.photo_url = photo_url;
        }

        static async authenticate(username, password) { 
            const result =  await db.query(`
                SELECT username, password, is_admin 
                FROM users 
                WHERE username = $1`,
                [username]);
            const user = result.rows[0];
            
            if(await bcrypt.compare(password, user.password) && user){
                return user;
            }
            else {
                return; 
            }
        }

    static async all() {
        const results = await db.query(
            `SELECT username,
            first_name,
            last_name, 
            email, 
            photo_url FROM users 
            ORDER BY username`
        );
        return results.rows.map(c => new User(c));
      }
    static async getSingleUser(username){
        const result = await db.query(`SELECT username,first_name,last_name, email,photo_url FROM users WHERE username =$1`, [username])
    
        let user = result.rows[0];
        if(user === undefined){
            const err = new Error(`No such user: ${username}`);
            err.status = 404;
            throw err;
        }
        return new User(user);
    }
    static async register(userData) {
        let admin;
        const pwd = await bcrypt.hash(userData.password, BCRYPT_WORK_FACTOR);
        const { username, first_name, last_name, email, photo_url, is_admin } = userData;
        if(is_admin) {
            admin = "True"; 
        } else {
            admin = "False";
        }
        const result = await db.query(
            `INSERT INTO users (
                    username,
                    password,
                    first_name,
                    last_name,
                    email,
                    photo_url,
                    is_admin)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING username, password, first_name, last_name, email, photo_url,is_admin`,
            [username, pwd,first_name,last_name,email,photo_url, admin]);
        
        return result.rows[0];
    }
    static async updateUser(username, data) {
        const { query, values } = partialUpdate("users",data,"username", username);
        const result = await db.query(query, values);
        
    
        if (result.rows.length === 0) {
            throw { message: `There is no user with username '${username}`, status: 404 }
        }
    
        return result.rows[0];
    }
    static async delete(username) {
        const result = await db.query(
          `DELETE FROM users 
             WHERE username = $1 
             RETURNING username`,
            [username]);
    
        if (result.rows.length === 0) {
          throw { message: `There is no such user with username '${username}`, status: 404 }
        }
      }

}

module.exports = User;