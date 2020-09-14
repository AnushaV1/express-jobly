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
        console.log(data.tokens)
	} catch (err) {
        console.error(err);
    }
})

afterEach(async function () {
	try {
	//	await clearDB();
	} catch (err) {
		console.error(err);
	}
})

afterAll(async () => {
	await closeDB();
})


describe('GET /users', () => {
	test('Get list of all users', async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(200);
    
    });
})

describe('GET /users /:username', () => {
	test('Get the user given username', async () => {
	const response = await request(app).get(`/users/testUser1`)
	    expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("user");
    
    })

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
		const response = await request(app).patch(`/jobs/30000?_token=${data.tokens.adminToken}`)
		.send({
        title:"Backend Developer",
        salary: 200000
	});

    expect(response.statusCode).toBe(404);
    });
});

describe("DELETE /users/:username", async () => {
    test("Delete user if logged in and correct user", async () => {
        const response = await request(app).delete(`/users/testUser2?_token=${data.tokens.userToken}`);
        expect(response.body.message).toBe("User deleted");
    });

    test("Respond with 401 unauthorized user", async () => {
        const response = await request(app).delete(`/users/testUser2`);
        expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Unauthorized, please login");
    });

    test("Responds with 404 error id not found", async () => {
        const response = await request(app).delete(`/users/notauser?_token=${data.tokens.userToken}`);
        expect(response.statusCode).toBe(401);
    });
});