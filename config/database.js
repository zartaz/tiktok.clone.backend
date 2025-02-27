const {connect, set} = require("mongoose");
const chalk = require("chalk");

// set("debug", true);


try {
    connect(process.env.MONGODB_URI, () => {
        console.log(
            chalk.greenBright("Connected to MongoDB.")
        );
    });
} catch (e) {
    console.log(e);
}