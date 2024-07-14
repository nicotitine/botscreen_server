const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const nacl = require("tweetnacl");
const utils = require("tweetnacl-util");
const encodeBase64 = utils.encodeBase64;
require("dotenv").config();
const VERSION = process.env.VERSION;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.get("/get_discord_list", async (req, res, next) => {
  try {
    const version = req.body.v;
    log(`Getting discord list from v${version}`);
    const obj = JSON.parse(fs.readFileSync("./discord.json", "utf8"));
    const data = {
      token: process.env.DISCORD_TOKEN,
      channels: obj,
    };
    const encrypted = encrypt(JSON.stringify(data));
    res.send(encrypted);
  } catch (e) {
    printError("Unable to get discord list");
    printError(e);
    res.send({ error: "unable to fetch discord list" });
  }
});

function log(text) {
  console.log(new Date().toJSON() + "\t" + text);
}

function printError(text) {
  console.error(new Date().toJSON() + "\t" + text);
}

function encrypt(data) {
  const nonce = nacl.randomBytes(24);
  const secretKey = Buffer.from(process.env.SEED, "utf-8");
  const sData = Buffer.from(data, "utf-8");
  const encrypted = nacl.secretbox(sData, nonce, secretKey);
  return `${encodeBase64(nonce)}:${encodeBase64(encrypted)}`;
}

module.exports = { app, log, printError };
