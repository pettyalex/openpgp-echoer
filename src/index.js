import express from "express";
import openpgp from "openpgp";

/**
 * Accepts base64 encoded encrypted text, returns a cleartext string.
 * @param {string} cipherText
 * @param {openpgp.KeyPair} keyPair
 */
async function decrypt(cipherText, keyPair) {
  const message = await openpgp.readMessage({
    armoredMessage: cipherText,
  });

  const { data: decrypted } = await openpgp.decrypt({
    message,
    decryptionKeys: keyPair.key, // for decryption
  });

  return decrypted.toString();
}

const app = express();
app.use(express.text()); // Parse text/plain request bodies
const port = 3000;

const keyPair = await openpgp.generateKey({
  userIDs: [{ name: "Alex Petty", email: "alex@example.com" }],
});

console.log(keyPair.publicKeyArmored);

app.get("/", (req, res) => {
  res.send("Hello World!");
  console.log(keyPair.key.isDecrypted());
});

app.post("/echo", (req, res) => {
  res.send(req.body);
});

app.get("/key", (req, res) => {
  res.send(keyPair.publicKeyArmored);
});

app.post("/decrypt", async (req, res) => {
  try {
    const cipherBody = req.body;

    const clearText = await decrypt(cipherBody, keyPair);

    res.send(clearText);
  } catch (e) {
    console.error(e);
    res.send(e.stack);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
