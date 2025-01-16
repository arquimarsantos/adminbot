const express = require("express");
const app = express();

app.get("/", function (req, res) {
    res.status(200).send("online!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
