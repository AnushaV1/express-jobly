const Router = require("express").Router;
const router = new Router();
const ExpressError = require("../helpers/expressError");
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const updateJobSchema = require("../schemas/upateJobSchema")
const createJobSchema = require("../schemas/createJobSchema")
const { ensureLoggedIn, checkCorrectUser, ensureAdmin } = require('../middleware/auth')

router.get("/",ensureLoggedIn, async(req, res, next) => {
    try {
        let jobs;
        searchTerms = req.query;
        jobs = await Job.all(searchTerms);
        return res.json({"jobs": jobs});   
    }
    catch(err){
        return next(err)
    }
})

router.get('/:id',ensureLoggedIn, async(req, res, next) => {
        try {
            const jobById = await Job.get(req.params.id);
            return res.json({job: jobById});   
        }
        catch(err){
            return next(err)
        }
    })

router.post("/",  ensureAdmin, async (req, res, next) => {
        try {
            const data = jsonschema.validate(req.body, createJobSchema);
            
            if (!data.valid) {
                return next({ status: 400, error: data.errors.map((e) => e.stack) });
            }
        const newJob = await Job.createJob(req.body.title,req.body.salary,req.body.equity,req.body.company_handle);
        return res.status(201).json({job: newJob});
        } catch(err){
            return next(err)
        }
    })


router.patch("/:id", ensureAdmin, async(req, res, next ) => {
    try {
        if ("id" in req.body) {
            return next({
                status: 400,
                message: "Not allowed"
            });
        }
        const result = jsonschema.validate(req.body, updateJobSchema);
        if(!result.valid){
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors,400);
            return next(error);
        }
        const job = await Job.updateJob(req.params.id, req.body);
        return res.json(job);
    } catch(err){
        return next(err)
    }
})

router.delete('/:id', ensureAdmin, async(req, res, next)=> {
    try {
        await Job.delete(req.params.id);
        return res.json({ message: "Job deleted" });
        
    } catch(err){
        return next(err)
    }
});
    module.exports = router;