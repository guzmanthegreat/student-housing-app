import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("database setup creates the main Roomies tables", () => {
  const sql = fs.readFileSync("../database/init.sql", "utf8");

  assert.match(sql, /CREATE TABLE IF NOT EXISTS users/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS rooms/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS chores/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS finances/);
});
