const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.send('Okteto: Hello world!');
})

app.listen(port, function () {
  console.log(`Starting hello-world server on port ${port}...`);
})
