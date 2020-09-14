const ExpressError = require("../helpers/expressError");
function searchJobBy(searchTerms) {
    let {title, min_salary, min_equity} = searchTerms;
    let query;
    if(!title && !min_salary && !min_equity) {
    query = `SELECT title,salary,equity,company_handle,date_posted FROM jobs ORDER BY date_posted`;
    }
    else {
        if(title) {
        query = `SELECT title, salary, equity, company_handle, date_posted FROM jobs WHERE title =${title}ORDER BY date_posted` ;
        }
        if(min_salary){
        query = `SELECT title, salary, equity, company_handle, date_posted FROM jobs WHERE salary >= ${min_salary} ORDER BY date_posted`;
        }
        if(min_equity){
        query = `SELECT title, salary, equity, company_handle, date_posted FROM jobs WHERE equity >= ${min_equity} ORDER BY date_posted`;
        }
    }

    return query;
}

module.exports = searchJobBy;
