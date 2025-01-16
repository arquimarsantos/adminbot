const express = require("express");
const app = express();

app.get("/", function (req, res) {
    res.status(200).send("online!");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
