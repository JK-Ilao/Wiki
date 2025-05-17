// api/index.js

import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import serverless from 'serverless-http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Parse JSON and URL‑encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Log all POST requests
app.use((req, res, next) => {
  if (req.method === 'POST') {
    const unixTimestamp = Math.floor(Date.now() / 1000);
    console.log(`[${unixTimestamp}] ${req.method} ${req.originalUrl}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);

    if (Array.isArray(req.body) && req.body.length > 0) {
      const first = req.body[0];
      console.log('--- Details from body ---');
      console.log('title:', first.title);
      console.log('description:', first.description);
      console.log('color:', first.color);
      if (first.footer)    console.log('footer:', first.footer);
      if (first.image)     console.log('image:', first.image);
      if (first.thumbnail) console.log('thumbnail:', first.thumbnail);
      if (first.author)    console.log('author:', first.author);
      if (first.fields)    console.log('fields:', first.fields);
    }
  }
  next();
});

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err, origin) => {
  console.error('Caught exception:', err, 'Exception origin:', origin);
});

// POST root for testing
app.post('/api/', (req, res) => {
  res.json({
    message: 'POST request received!',
    body: req.body
  });
});

// ========== Dynamic JSON routes ==========

// GET legendary history
app.get('/api/legendaryHistory', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM LegendarySpawns', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

// GET ultrabeast history
app.get('/api/ultrabeastHistory', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM UltraBeastSpawns', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

// GET paradox list
app.get('/api/paradoxList', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM Paradox ORDER BY Name', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

// GET paradox details
app.get('/api/paradoxDet', (req, res) => {
  const { type, value } = req.query;
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    let sql, params;
    if (type === 'Name') {
      sql = 'SELECT * FROM Paradox WHERE name = ?';
      params = [value];
    } else if (type === 'Biome') {
      sql = 'SELECT * FROM Paradox WHERE biome LIKE ?';
      params = [`%${value}%`];
    } else if (type === 'Time') {
      sql = 'SELECT * FROM Paradox WHERE time = ?';
      params = [value];
    } else if (type === 'Weather') {
      if (value.toLowerCase() === 'rain') {
        sql = 'SELECT * FROM Paradox WHERE weather = ? OR weather = ?';
        params = ['Rain', 'Rain/Storm'];
      } else if (value.toLowerCase() === 'storm') {
        sql = 'SELECT * FROM Paradox WHERE weather = ? OR weather = ?';
        params = ['Storm', 'Rain/Storm'];
      } else {
        sql = 'SELECT * FROM Paradox WHERE weather = ?';
        params = [value];
      }
    } else if (type === 'Condition') {
      sql = 'SELECT * FROM Paradox WHERE condition = ?';
      params = [value];
    }
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

// GET ultra list
app.get('/api/ultra', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM UltraBeast ORDER BY Name', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

// GET beast details
app.get('/api/beastDetails', (req, res) => {
  const { type, value } = req.query;
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    let sql, params;
    if (type === 'Name') {
      sql = 'SELECT * FROM UltraBeast WHERE name = ? ORDER BY Name';
      params = [value];
    } else if (type === 'Biome') {
      sql = 'SELECT * FROM UltraBeast WHERE biome LIKE ? ORDER BY Name';
      params = [`%${value}%`];
    } else if (type === 'Condition') {
      sql = 'SELECT * FROM Legendarys WHERE condition = ? ORDER BY Name';
      params = [value];
    } else if (type === 'Weather') {
      if (value.toLowerCase() === 'rain') {
        sql = 'SELECT * FROM UltraBeast WHERE weather = ? OR weather = ? ORDER BY Name';
        params = ['Rain', 'Rain/Storm'];
      } else if (value.toLowerCase() === 'storm') {
        sql = 'SELECT * FROM UltraBeast WHERE weather = ? OR weather = ? ORDER BY Name';
        params = ['Storm', 'Rain/Storm'];
      } else {
        sql = 'SELECT * FROM UltraBeast WHERE weather = ? ORDER BY Name';
        params = [value];
      }
    }
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

// GET all data
app.get('/api/data', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM Legendarys ORDER BY Name', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

// GET pokemon filtered
app.get('/api/pokemon', (req, res) => {
  const { type, value } = req.query;
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    let sql, params;
    if (type === 'Name') {
      sql = 'SELECT * FROM Legendarys WHERE name = ? ORDER BY Name';
      params = [value];
    } else if (type === 'Biome') {
      sql = 'SELECT * FROM Legendarys WHERE biome LIKE ? ORDER BY Name';
      params = [`%${value}%`];
    } else if (type === 'Time') {
      sql = 'SELECT * FROM Legendarys WHERE time = ? ORDER BY Name';
      params = [value];
    } else if (type === 'Weather') {
      if (value.toLowerCase() === 'rain') {
        sql = 'SELECT * FROM Legendarys WHERE weather = ? OR weather = ? ORDER BY Name';
        params = ['Rain', 'Rain/Storm'];
      } else if (value.toLowerCase() === 'storm') {
        sql = 'SELECT * FROM Legendarys WHERE weather = ? OR weather = ? ORDER BY Name';
        params = ['Storm', 'Rain/Storm'];
      } else {
        sql = 'SELECT * FROM Legendarys WHERE weather = ? ORDER BY Name';
        params = [value];
      }
    } else if (type === 'Condition') {
      sql = 'SELECT * FROM Legendarys WHERE condition = ? ORDER BY Name';
      params = [value];
    }
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

// GET prices tables
app.get('/api/pricesLeggy', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM LeggyPrice', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

app.get('/api/pricesUltra', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM UltraPrice', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

app.get('/api/pricesPokes', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM PokePrice', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

app.get('/api/pricesMega', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM MegaStonePrice', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

app.get('/api/pricesBreed', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM BreedItemPrice', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

app.get('/api/pricesEvo', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM EvoItemPrice', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

app.get('/api/pricesZcrys', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM ZCrystal', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

app.get('/api/pricesMisc', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'app', 'database', 'Legendarys.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('Error opening database:', err);
      return res.status(500).send(err);
    }
    db.all('SELECT * FROM Miscalleanous', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send(err);
      }
      res.json(rows);
    });
  });
});

// Wrap and export the app as a serverless function
export default serverless(app);
