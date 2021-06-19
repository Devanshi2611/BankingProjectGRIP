const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./customerDB.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

const app = express();
app.use(cors())

app.use('/uploads', express.static('uploads'))
app.use(express.static('public'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}));

var curTr = 0;
var curUser = 0;
app.post("/isLogged", function(req, res) {
  res.send(curUser.toString());
  res.end();
});

app.post("/login", function(req, res) {
  curUser = req.body["uid"];
  res.send("A");
  res.end();
});

app.post("/logout", function(req, res) {
  curUser = 0;
  res.send("A");
  res.end();
});

app.post("/cBal", function(req, res) {
  if (curUser != 0) {
    db.all("SELECT * FROM users where id=" + curUser + " ", (err, rows) => {
      res.send(rows[0].balance.toString());

      res.end();
    });
  } else {
    res.send("ERR");

    res.end();
  }
});

app.post("/getT", function(req, res) {
  if (curTr == 0) res.send("0");
  else {
    db.all("SELECT * FROM users where id=" + curTr + " ", (err, rows) => {
      res.send(rows);
    });
  }
});

app.post("/transactIt", (req, res) => {
  db.all("SELECT * FROM users where id=" + curUser + " ", (err, rows) => {
    var nw = parseInt(parseInt(rows[0].balance) - parseInt(parseInt(req.body["amount"])));
    if (nw < 0) {
      res.send("Insufficient Balance");
    } else {
      db.run("UPDATE users SET balance=" + nw + " WHERE id=" + curUser + " ", function(errA) {
        if (errA) {
          res.send("An Error Occured");
          return console.error(errA.message);
        }
        db.all("SELECT * FROM users where id=" + curTr + " ", (errB, rowsA) => {
          var nwa = parseInt(parseInt(rowsA[0].balance)) + parseInt(parseInt(req.body["amount"]));
          db.run("UPDATE users SET balance=" + nwa + " WHERE id=" + req.body["id"] + " ", function(errB) {
            if (errB) {
              res.send("An Error Occured");
              return console.error(errB.message);
            }
            res.send("Transaction Completed");

          });
        });
      });

    }
  });





})

app.post("/setTran", (req, res) => {
  curTr = req.body["id"];
  res.send("1");
})

app.post("/getAll", function(req, res) {
  db.all("SELECT * FROM users WHERE id!=" + curUser + "", (err, rows) => {
    res.send(rows);
  });
});

app.listen(8000 || process.env.PORT, function() {
  console.log("Server Started Waiting For Database Connection")
})
