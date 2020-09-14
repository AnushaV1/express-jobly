const ExpressError = require("./expressError");
function searchCompanyBy(searchValues) {
    let {_token, name, min_employees, max_employees } = searchValues;
    let query;
    if(!name && !min_employees && !max_employees) {
        query = `SELECT handle, name, num_employees, description, logo_url FROM companies ORDER BY name`;
        }
    else {
        if (min_employees > max_employees) {
            throw new ExpressError("Invalid parameters", 400);
        }
        else if(name) {
            query = `SELECT handle, name,num_employees, description, logo_url FROM companies WHERE name= ${name}`;
        
        }
        else if(min_employees && !max_employees){
            query = `SELECT handle, name,num_employees, description, logo_url FROM companies WHERE num_employees >=${min_employees}`;

        }
        else {
            query = `SELECT handle, name,num_employees, description, logo_url FROM companies WHERE num_employees BETWEEN ${min_employees} AND ${max_employees}`;
        
        }
    }

    return query;
}

module.exports = searchCompanyBy;
