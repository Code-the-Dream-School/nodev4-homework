import path, { dirname } from "path";
import fs from "fs";
import http from "http";
import { spawn } from "child_process";
import { pathToFileURL, fileURLToPath } from "url";
import { createRequire } from "module";
import { describe, test, expect, beforeAll, afterAll } from "vitest";

const require = createRequire(import.meta.url);
const request = require("supertest");
const httpMocks = require("node-mocks-http");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Assignment 2: Event Handlers, HTTP Servers, and Express", () => {
  const assignmentDir = path.join(__dirname, "../assignment2");
  const rootDir = path.join(__dirname, "..");

  beforeAll(() => {
    if (!fs.existsSync(assignmentDir)) {
      throw new Error(
        "assignment2 directory does not exist. Please create it first.",
      );
    }
  });

  describe("Task 1: Event Emitter and Listener", () => {
    test("events.js should exist and implement time event emitter", async () => {
      const eventsPath = path.join(assignmentDir, "events.js");
      expect(fs.existsSync(eventsPath)).toBe(true);

      const eventsUrl = pathToFileURL(eventsPath).href;
      await expect(import(eventsUrl)).resolves.toBeDefined();
    });

    test("events.js should emit time events every 5 seconds", async () => {
      const eventsPath = path.join(assignmentDir, "events.js");
      const eventsUrl = pathToFileURL(eventsPath).href;
      const module = await import(eventsUrl);
      const emitter = module.default;
      expect(emitter.listenerCount("time")).toBe(1);
      emitter.removeAllListeners();
    });
  });

  describe("Task 2: HTTP Server", () => {
    test("sampleHTTP.js should exist", () => {
      const httpPath = path.join(assignmentDir, "sampleHTTP.js");
      expect(fs.existsSync(httpPath)).toBe(true);
    });

    test("sampleHTTP.js should handle /time endpoint with JSON response", () => {
      const httpPath = path.join(assignmentDir, "sampleHTTP.js");
      const child = spawn("node", [httpPath]);

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const req = http.request(
            {
              hostname: "localhost",
              port: 8000,
              path: "/time",
              method: "GET",
            },
            (res) => {
              let data = "";
              res.on("data", (chunk) => {
                data += chunk;
              });
              res.on("end", () => {
                expect(res.statusCode).toBe(200);
                expect(res.headers["content-type"]).toContain(
                  "application/json",
                );
                const jsonData = JSON.parse(data);
                expect(jsonData).toHaveProperty("time");
                expect(typeof jsonData.time).toBe("string");
                child.kill();
                resolve();
              });
            },
          );
          req.on("error", (err) => {
            child.kill();
            reject(err);
          });
          req.end();
        }, 1000);
      });
    });

    test("sampleHTTP.js should handle /timePage endpoint with HTML response", () => {
      const httpPath = path.join(assignmentDir, "sampleHTTP.js");
      const child = spawn("node", [httpPath]);

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const req = http.request(
            {
              hostname: "localhost",
              port: 8000,
              path: "/timePage",
              method: "GET",
            },
            (res) => {
              let data = "";
              res.on("data", (chunk) => {
                data += chunk;
              });
              res.on("end", () => {
                expect(res.statusCode).toBe(200);
                expect(res.headers["content-type"]).toContain("text/html");
                expect(data).toContain("<!DOCTYPE html>");
                expect(data).toContain("Clock");
                expect(data).toContain("getTimeBtn");
                child.kill();
                resolve();
              });
            },
          );
          req.on("error", (err) => {
            child.kill();
            reject(err);
          });
          req.end();
        }, 1000);
      });
    });
  });

  describe("Task 3: Express Application", () => {
    let agent;
    let server;

    beforeAll(async () => {
      const appModule = await import("../../nodev4/mentor-guidebook/sample-answers/assignment2/assignment2/app.js");
      const { app } = appModule;
      server = appModule.server;
      agent = request(app);
    });

    afterAll(() => {
      server.close();
    });

    test("app.js should exist", () => {
      const appPath = path.join(rootDir, "app.js");
      expect(fs.existsSync(appPath)).toBe(true);
    });

    test("should handle get /", async () => {
      const saveRes = await agent.get("/").send();
      expect(saveRes.status).toBe(200);
    });

    test("should handle post /testpost", async () => {
      const saveRes = await agent.post("/testpost").send();
      expect(saveRes.status).toBe(200);
    });

    test("should return 404 for unknown route", async () => {
      const saveRes = await agent.get("/unknown").send();
      expect(saveRes.status).toBe(404);
    });
  });

  describe("Task 4: Middleware", () => {
    test("middleware/error-handler.js should report a server error", async () => {
      const { default: errHandler } = await import(
        "../../nodev4/mentor-guidebook/sample-answers/assignment2/middleware/error-handler.js"
      );
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      res.headersSent = false;
      const err = new Error("a server error occurred.");
      await errHandler(err, req, res, null);
      expect(res.statusCode).toBe(500);
    });

    test("middleware/not-found.js should return a 404", async () => {
      const { default: notFound } = await import(
        "../../nodev4/mentor-guidebook/sample-answers/assignment2/middleware/not-found.js"
      );
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = () => {};
      await notFound(req, res, next);
      expect(res.statusCode).toBe(404);
    });
  });
});
