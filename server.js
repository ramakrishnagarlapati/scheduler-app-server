const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create or open a database file named 'scheduler.db'
const db = new sqlite3.Database("scheduler.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS mentors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        availability BOOLEAN,
        areas_of_expertise TEXT,
        is_premium BOOLEAN
      )`);

  db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        availability BOOLEAN,
        area_of_interest TEXT
      )`);
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        mentor_id INTEGER,
        duration INTEGER,
        is_premium BOOLEAN
      )`);

  // Insert dummy data into mentors table
  db.get("SELECT COUNT(*) AS count FROM mentors", (err, row) => {
    if (err) {
      console.error(err.message);
    }
    if (row.count === 0) {
      db.run(
        `INSERT OR IGNORE INTO mentors (name, availability, areas_of_expertise, is_premium) VALUES 
            ('Prasanth Yalla', 1, 'FMCG Sales', 0),
            ('Venkat Prabhu', 1, 'FMCG Sales', 1),
            ('Srinu Yerrabakki', 1, 'FMCG Sales', 1),
            ('Pavan Gaddam', 1, 'FMCG Sales', 0), 
            ('Krishna Billuri', 1, 'Equity Research', 1),
            ('Rama Siri', 1, 'Equity Research', 0),
            ('krishna Prasad', 1, 'Equity Research', 0),
            ('Bhatta chari', 1, 'Equity Research', 1),
            ('Krishna Kallam', 1, 'Equity Research', 1),
            ('Arjun Gudivada', 1, 'Digital Marketing', 1),
            ('Krishna Rao', 1, 'Digital Marketing', 0),
            ('Ram mohan', 1, 'Digital Marketing', 0)
          `
      );
    }
  });
});

//API ENDPOINTS

//Get all mentors by area of interest

app.get("/mentors", (req, res) => {
  const { areas_of_expertise } = req.query;
  db.all(
    `SELECT * FROM mentors WHERE areas_of_expertise LIKE ?`,
    [`%${areas_of_expertise}%`],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ mentors: rows });
    }
  );
});

//create a booking

app.post("/bookings", (req, res) => {
  const { student_id, mentor_id, duration, is_premium } = req.body;
  db.run(
    `INSERT INTO bookings (student_id, mentor_id,duration, is_premium) 
      VALUES (?, ?, ?, ?)`,
    [student_id, mentor_id, duration, is_premium],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ booking_id: this.lastID });
    }
  );
});

//get all bookings

app.get("/bookings", (req, res) => {
  db.all("SELECT * FROM bookings", function (err, rows) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ bookings: rows });
  });
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
