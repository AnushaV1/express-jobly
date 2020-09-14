process.env.NODE_ENV = "test";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../../db");
const SECRET_KEY = "test";
const Company = require("../../models/company")
const User = require("../../models/user")

const BCRYPT_WORK_FACTOR = 1;
async function setInitialDB() {
    let data = {};
    try {
        let tokens = { adminToken: "", userToken: "" };
        const hashPwd1 = await bcrypt.hash("test_pwd1", BCRYPT_WORK_FACTOR);
            const test_user1 = await db.query(`
                    INSERT INTO users (username, password, first_name, last_name, email, is_admin)
                    VALUES ('testUser1', $1, 'fname1', 'lname1', 'test1@gmail.com', true)
                    RETURNING username, is_admin`,
                [hashPwd1]
            );
            tokens.adminToken = jwt.sign({username: test_user1.rows[0].username, is_admin: test_user1.rows[0].is_admin}, SECRET_KEY);
        
            // Test user 2 - Not an admin
        const hashPwd2 = await bcrypt.hash("test_pwd2", BCRYPT_WORK_FACTOR);
        const test_user2 = await db.query(`
            INSERT INTO users (username, password, first_name, last_name, email, is_admin)
            VALUES ('testUser2', $1, 'fname2', 'lname2', 'test2@gmail.com', false)
            RETURNING username, is_admin`, [hashPwd2]
    );
        tokens.userToken = jwt.sign({username: test_user2.rows[0].username,is_admin: test_user2.rows[0].is_admin}, SECRET_KEY);
        data.tokens = tokens;
        
    const test_company1 = await db.query(`
        INSERT INTO companies (handle, name, num_employees) 
        VALUES ($1, $2, $3) 
        RETURNING *`,["CTS", "Cognizant Inc.", 800]
    );

    const test_company2 = await db.query(`
        INSERT INTO companies (handle, name, num_employees) 
        VALUES ($1, $2, $3) 
        RETURNING *`, ["TCS", "Tata Inc.", 1000]
    );

    companies = [test_company1.rows[0], test_company2.rows[0]];
    data.companies = companies;

        const test_job1 = await db.query(`
        INSERT INTO jobs (title, salary, equity, company_handle) 
        VALUES ('software test job', 60000, 0.5, 'CTS') 
        RETURNING *`);

    const test_job2 = await db.query(`
        INSERT INTO jobs (title, salary, equity, company_handle) 
        VALUES ('test job 2', 80000, 0.6, 'TCS') 
        RETURNING *`);

    jobs = [test_job1.rows[0], test_job2.rows[0]];
    data.jobs = jobs;
    return data;
    
    } catch (e) {
        console.error(e);
    }
}

async function clearDB() {
try {
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");
    await db.query("ALTER SEQUENCE jobs_id_seq RESTART WITH 1");
} catch (e) {
    console.error(e);
}
}

async function closeDB() {
try {
    await db.end();
} catch (e) {
    console.error(e);
}
}

module.exports = {
    setInitialDB,
    clearDB,
    closeDB
};