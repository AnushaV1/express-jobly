process.env.NODE_ENV = "test";
const app = require('../../app');
const db = require("../../db");
const request = require("supertest");

const { setInitialDB, clearDB, closeDB } = require("./configDB")

let data = {};
beforeEach(async function () {
	try {
        const clear_db = await clearDB();
        data = await setInitialDB();
    } catch (err) {
        console.error(err);
    }
})

afterEach(async function () {
	try {
		await clearDB();
	} catch (err) {
		console.error(err);
	}
})

afterAll(async () => {
	await closeDB();
})

describe('GET /jobs', () => {
	test('Get list of all jobs', async () => {
        const res = await request(app).get('/jobs')
        .send({_token: data.tokens.userToken})
        expect(res.statusCode).toBe(200);
    });
    test('Responds with 401 for unathenticated users', async () => {
        const res = await request(app).get(`/jobs`)
        expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, please login')
    })
})

describe('GET /jobs /:id', () => {
	test('Get the job with id requested', async () => {
	const response = await request(app).get(`/jobs/1`)
	
        .send({_token: data.tokens.userToken})
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("job");
    
    })
    test("Respond 401 with unauthorized message", async () => {
        const response = await request(app).get("/jobs/1");
        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.text).message).toBe("Unauthorized, please login");
    });
    
})

describe("POST /jobs Admin", () => {
    test("POST jobs if admin", async() => {
        const response = await request(app).post(`/jobs?_token=${data.tokens.adminToken}`)
        .send({
		title:"Backend Developer",
		salary: 200000,
		equity:0.7,
		company_handle:"TCS"
        });
        expect(response.statusCode).toBe(201);
        expect(response.body.job).toHaveProperty("title");
    })
    
    test("Respond 401 if not admin", async () => {
        const response = await request(app).post("/jobs")
        .send({
            title:"Backend Developer",
			salary: 200000,
			equity:0.7,
			company_handle:"NASA",
            _token: data.tokens.userToken
        });
    
        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.text).message).toBe(
        "Unauthorized, admin privileges required"
        );
    });
})

describe("PATCH /jobs/:id", async () => {
    test("should update the company's information (admin)", async () => {
        const response = await request(app).patch("/jobs/1").send({
            title:"Backend Developer",
			salary: 200000,
			equity:0.7,
			_token: data.tokens.adminToken
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.salary).toBe(200000);
    });

    test("Respond with 401 for unauthorized user", async () => {
        const response = await request(app).patch("/jobs/1").send({
        title:"Backend Developer",
		salary: 200000,
		equity:0.7,
		company_handle:'CTS',
        _token: data.tokens.userToken
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.text).message).toBe(
        "Unauthorized, admin privileges required"
        );
    });

    test("Respond with 404 with Job not found", async () => {
		const response = await request(app).patch(`/jobs/300?_token=${data.tokens.adminToken}`)
		.send({
        title:"Backend Developer",
        salary: 200000
	});

    expect(response.statusCode).toBe(404);
    });
});

describe("DELETE /jobs/:id", async () => {
    test("Delete company with admin privilege", async () => {
        const response = await request(app).delete(`/jobs/1?_token=${data.tokens.adminToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Job deleted");
    });

    test("Respond with 401 unauthorized user", async () => {
        const response = await request(app).delete(`/jobs/1?_token=${data.tokens.userToken}`
    );

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.text).message).toBe(
        "Unauthorized, admin privileges required"
    );
    });

    test("Responds with 404 error id not found", async () => {
        const response = await request(app).delete(`/jobs/1000000000?_token=${data.tokens.adminToken}`);
        expect(response.statusCode).toBe(404);
    });
});