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


describe('GET /companies', () => {
	test('Get list of all companies', async () => {
        const res = await request(app).get('/companies')
        .send({_token: data.tokens.userToken})
        expect(res.statusCode).toBe(200);
    });
    test('Responds with 401 if user is not authenticated', async () => {
        const res = await request(app).get(`/companies`)
        expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, please login')
    })
})

describe('GET /companies/:handle', () => {
	test('Get the company with handle requested', async () => {
	const response = await request(app).get(`/companies/CTS`)
        .send({_token: data.tokens.userToken})
        expect(response.statusCode).toBe(200);
        expect( response.body.company).toHaveProperty("name");
    
    })
    test("Respond 401 with unauthorized message", async () => {
        const response = await request(app).get("/companies/CTS");
        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.text).message).toBe("Unauthorized, please login");
    });
    
})

describe("POST /companies Admin", () => {
    test("POST companies if admin", async() => {
        const response = await request(app).post(`/companies?_token=${data.tokens.adminToken}`)
        .send({
                handle:"NASA",
                name:"Nasa",
                num_employees:5000,
                description:"Aerospace company",
                logo_url:"http://nasa.image.com"
        });
        expect(response.statusCode).toBe(201);
        expect(response.body.company).toHaveProperty("name");
    })
    test("Test Duplicate Entry with Admin", async () => {
        const response = await request(app).post("/companies").send({
            handle: "CTS",
            name: "Cognizant Inc.",
            num_employees: 800,
            _token: data.tokens.adminToken,
        });
    
        expect(response.statusCode).toBe(500);
    });

    test("Respond 401 if not admin", async () => {
        const response = await request(app).post("/companies")
        .send({
            handle: "GM",
            name: "General Motors",
            num_employees: 2000,
            description:"Car company",
            logo_url:"http://gm.car.image.com",
            _token: data.tokens.userToken
        });
    
        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.text).message).toBe(
        "Unauthorized, admin privileges required"
        );
    });
})

describe("PATCH /companies/:handle", async () => {
    test("should update the company's information (admin)", async () => {
        const response = await request(app).patch("/companies/CTS").send({
        num_employees: 1000,
        description: "Cognizant Technology services company",
        logo_url: "https://cts.image.com/photo.jpg",
        _token: data.tokens.adminToken
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.num_employees).toBe(1000);
    expect(response.body.description).toBe("Cognizant Technology services company");
    
    });

    test("Respond with 401 for unauthorized user", async () => {
        const response = await request(app).patch("/companies/CTS").send({
        name: "Cognizant Solutions",
        num_employees: 600,
        description: "Solutions company",
        _token: data.tokens.userToken
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.text).message).toBe(
        "Unauthorized, admin privileges required"
        );
    });

    test("Respond with 404 with Company not found", async () => {
        const response = await request(app).patch("/companies/randomHandle").send({
        name: "Best Company Inc",
        num_employees: 50,
        description: "Best desc",
        logo_url: "https://random.com/new.jpg",
        _token: data.tokens.adminToken,
    });

    expect(response.statusCode).toBe(404);
    });
});

describe("DELETE /companies/:handle", async () => {
    test("Delete company with admin privilege", async () => {
        const response = await request(app).delete(
        `/companies/CTS?_token=${data.tokens.adminToken}`
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Company deleted");
    });

    test("Respond  with 401 unauthorized user", async () => {
        const response = await request(app).delete(`/companies/CTS?_token=${data.tokens.userToken}`
    );

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.text).message).toBe(
        "Unauthorized, admin privileges required"
    );
    });

    test("Responds with 404 error company not found", async () => {
        const response = await request(app).delete(
        `/companies/nocompany?_token=${data.tokens.adminToken}`
        );

    expect(response.statusCode).toBe(404);
    });
});