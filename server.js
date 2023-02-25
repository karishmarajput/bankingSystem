var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const { join } = require("path");
const router = express.Router();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

app.set("view engine", "ejs");
mongoose.set("strictQuery", false);
mongoose.connect(
  "mongodb+srv://Admin:Admin@cluster0.h6da7ib.mongodb.net",
  { useNewUrlParser: true },
  { useUnifiedTopology: true },
  (e) => {
    console.log("database connected");
    console.log(e);
  }
);
console.log("hey");

mongoose.Promise = global.Promise;
mongoose.connection.on("error", (err) => {
  console.log(err);
});

const customerSchema = new mongoose.Schema({
  name: String,
  accountNo: Number,
  balance: Number,
  email: String,
});
const transactionSchema = new mongoose.Schema({
  customer1: String,
  customer2: String,
  amount: Number,
});

const customer = new mongoose.model("customer", customerSchema);
const transaction = new mongoose.model("transaction", transactionSchema);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});

app.get("/view", (req, res) => {
  customer.find({}, function (err, allDetails) {
    if (err) {
      console.log(err);
    } else {
      res.render("view", { details: allDetails });
    }
  });
});
app.get("/transaction", (req, res) => {
  transaction.find({}, function (err, allDetails) {
    if (err) {
      console.log(err);
    } else {
      customer.find({}, function (err, users) {
        if (err) {
          console.log(err);
        } else {
          res.render("transaction", { details: allDetails, users: users });
        }
      });
    }
  });
});
app.get("/transfer", (req, res) => {
  let acc = req.query.account;
  let name = req.query.name;
  let email = req.query.email;
  customer.find({ accountNo: { $ne: acc } }, function (err, users) {
    if (err) {
      console.log(err);
    } else {
      res.render("transfer", {
        accountNo: `${acc}`,
        name: `${name}`,
        email: `${email}`,
        users: users,
      });
    }
  });
});
app.post("/transfer", async (req, res) => {
  var obj = {
    customer1: req.body.customer1,
    customer2: req.body.customer2,
    amount: req.body.amount,
  };
  console.log(obj);
  customer.findOne({ accountNo: obj.customer1 }, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      if (parseInt(user.balance) < parseInt(obj.amount)) {
        res.send("Account Balance Error! Check your bank balance");
      } else {
        customer.findOneAndUpdate(
          { accountNo: obj.customer2 },
          { $inc: { balance: parseInt(obj.amount) } },
          function (err, res) {
            if (err) throw err;
            console.log("customer1 updated");
          }
        );
        customer.updateOne(
          { accountNo: obj.customer1 },
          { balance: parseInt(user.balance) - parseInt(obj.amount) },
          function (err, res) {
            if (err) throw err;
            console.log("customer2 updated");
          }
        );
        transaction.create(obj, (err, item) => {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/");
          }
        });
      }
    }
  });
});
app.get("/insert", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/insert.html"));
});
app.post("/insert", (req, res) => {
  var obj = {
    name: "nameee",
    accountNo: 102929,
    balance: 6823168,
    email: "karrajput3948@hsjh.hsd",
  };

  console.log(obj);
  customer.create(obj, (err, item) => {
    if (err) {
      console.log(err);
    } else {
      item.save();
      res.redirect("/");
    }
  });
});

app.listen(3000, () => {
  console.log("server is listening");
});
