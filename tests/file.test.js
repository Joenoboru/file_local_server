const request = require("supertest");
const app = require("../app");
const path = require("path");

describe("POST /file", () => {
  it("post file with form data", () => {
    return request(app)
      .post("/file/test")
      .attach("file", path.resolve(__dirname, "./test.txt"))
      .expect(200);
  });
});

describe("PATCH /file", () => {
  it("PATCH file with form data", () => {
    return request(app)
      .patch("/file/test")
      .attach("file", path.resolve(__dirname, "./test.txt"))
      .expect(200);
  });
});

describe("GET file/test dir", () => {
  it("should return all products", async () => {
    const res = await request(app).get(
      "/file/test?orderBy=fileName&orderByDirection=Asending&filterByName=test"
    );
    expect(res.statusCode).toBe(200);
  });
});

describe("GET file/test/test.txt file", () => {
  it("should return all products", async () => {
    const res = await request(app).get(
      "/file/test/test.txt?orderBy=fileName&orderByDirection=Asending&filterByName=test"
    );
    expect(res.statusCode).toBe(200);
  });
});

describe("DELETE /file/test", () => {
  it("DELETE file ", () => {
    return request(app).delete("/file/test").expect(200);
  });
});
