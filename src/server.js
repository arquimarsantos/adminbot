const express = require("express");
const app = express();
app.get('/', function (res) {
    res.send('online!');
});
app.listen(8000);
