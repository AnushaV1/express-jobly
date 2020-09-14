const express = require("express");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");
const jsonschema = require("jsonschema");
const createCompanySchema = require("../schemas/createCompanySchema");
const updateCompanySchema = require("../schemas/updateCompanySchema");
const router = new express.Router();
const { ensureLoggedIn, checkCorrectUser, ensureAdmin } = require('../middleware/auth')

router.get('/', ensureLoggedIn,  async(req, res, next) => {
        let companies;
        try {
            companies = await Company.getAll(req.query);              
            return res.json({"companies": companies});
        }
        catch(err){
            return next(err)
        }
    })

router.get('/:handle', ensureLoggedIn, async(req, res, next) => {
        try {
            const companyHandle = await Company.get(req.params.handle);
            return res.json({company: companyHandle});   
        }
        catch(err){
            return next(err)
        }
    })

router.post("/", ensureAdmin, async(req, res, next) => {
        try {
            const data = jsonschema.validate(req.body, createCompanySchema);

            if (!data.valid) {
                return next({ status: 400, error: data.errors.map((e) => e.stack) });
            }
        const newCompany = await Company.create(req.body.handle,req.body.name,req.body.num_employees, req.body.description,req.body.logo_url);
        return res.status(201).json({company: newCompany})
        } catch(err){
            return next(err)
        }
    })


router.patch("/:handle", ensureAdmin, async(req, res, next ) => {
    try {
        if ("handle" in req.body) {
            return next({
                status: 400,
                message: "Not allowed"
            });
        }
        const result = jsonschema.validate(req.body, updateCompanySchema);
        if(!result.valid){
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors,400);
            return next(error);
        }
        
        const company = await Company.update(req.params.handle, req.body);
        return res.json(company);
    } catch(err){
        return next(err)
    }

})

router.delete('/:handle', ensureAdmin, async(req, res, next)=> {
    try {
        await Company.delete(req.params.handle);
        return res.json({ message: "Company deleted" });
        
    } catch(err){
        return next(err)
    }
});
    module.exports = router;