process.env.NODE_ENV = "test";
const app = require('../../app');
const db = require("../../db");
const request = require("supertest");

const { setInitialDB, clearDB, closeDB } = require("./configDB")

let data = {};
const BCRYPT_WORK_FACTOR = 1;

beforeEach(async function () {
	try {
        const clear_db = await clearDB();
        data = await setInitialDB();
  } catch (err) {
        console.error(err);
    }
})

describe("POST / Register user", () => {
  test("Register new user", async() => {
      const response = await request(app).post(`/`)
      .send({
              username:"testUser3",
              password:"testpwd3",
              first_name:"test_fname",
              last_name:"test_lname",
              email:"test3@mail.com",
              photo_url:"http://nasa.image.com"
      });
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("token");

      const res = await request(app).get(`/users/testUser3`)
	    expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("user");
  })
  test("Test duplicate username", async () => {
      const response = await request(app).post("/").send({
        username:"testUser2",
        password:"test_pwd2",
        first_name:"fname2",
        last_name:"lname2",
        email:"test2@gmail.com"
      });
  
      expect(response.statusCode).toBe(400);
  });

})

describe('POST /login', function () {
  test("returns token", async function () {
    const response = await request(app)
      .post(`/login`)
      .send({ username: "testUser2", password: "test_pwd2" });
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(expect.objectContaining({ token: expect.any(String) }));
  });

  test("fails with wrong password", async function () {
    const response = await request(app)
      .post(`/login`)
      .send({ username: "testUser2", password: "WRONG" });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid username/password");
  
  });

  test("Respond with 400 for no username or password", async function () {
    const response = await request(app)
      .post(`/login`)
      .send({ username: "testUser2"});
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Username and password required");
  
  });
});


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

