import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Add these lines to parse incoming POST bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Log all POST requests
app.use((req, res, next) => {
  if (req.method === 'POST') {
    const unixTimestamp = Math.floor(Date.now() / 1000);
    console.log(`[${unixTimestamp}] ${req.method} ${req.originalUrl}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);

    // If body is an array and has at least one object, extract details
    if (Array.isArray(req.body) && req.body.length > 0) {
      const first = req.body[0];
      console.log('--- Details from body ---');
      console.log('title:', first.title);
      console.log('description:', first.description);
      console.log('color:', first.color);
      if (first.footer) console.log('footer:', first.footer);
      if (first.image) console.log('image:', first.image);
      if (first.thumbnail) console.log('thumbnail:', first.thumbnail);
      if (first.author) console.log('author:', first.author);
      if (first.fields) console.log('fields:', first.fields);
    }
  }
  next();
});

// Respond to POST requests to the root path
app.post('/', (req, res) => {
  res.json({
    message: 'POST request received!',
    body: req.body
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
  console.log('Caught exception:', err, 'Exception origin:', origin);
});

console.log('Public:');
app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'public', 'js')));
app.use('/favicon.ico', express.static(path.join(__dirname, '..', 'public', 'img', 'favicon.ico')));
app.use('/Map', express.static(path.join(__dirname, '..', 'public', 'img', 'map.png')));
app.use(express.static(path.join(__dirname, '..', 'html')));

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'index.html'));
});

app.get('/Legendarys', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'leggy.html'));
});

app.get('/UltraBeast', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'ultra.html'));
});

app.get('/Details', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'details.html'));
});

app.get('/Beast', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'beast.html'));
});

app.get('/PokemonPrices', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'PriceP.html'));
});

app.get('/LegendaryPrices', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'PriceL.html'));
});

app.get('/MegaStoneZCrystalPrice', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'PriceM.html'));
});

app.get('/BreedEvoPrice', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'PriceB.html'));
});

app.get('/MiscPrice', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'PriceMisc.html'));
});

app.get('/Paradox', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'paradox.html'));
});

app.get('/ParadoxDetails', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'paradoxDetail.html'));
});

app.get('/SpawnsHistory', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'html', 'spawns.html'));
});

app.get('/legendaryHistory', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM LegendarySpawns', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }
      res.json(rows);
    });
  });
});

app.get('/ultrabeastHistory', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM UltraBeastSpawns', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }
      res.json(rows);
    });
  });
});

app.get('/paradoxList', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM Paradox order by Name', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }
      res.json(rows);
    });
  });
});

app.get('/pradoxDet', (req, res) => {
  const type = req.query.type;
  const value = req.query.value;

  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }

    let sql;
    let params;
    if(type === 'Name'){
      sql = `SELECT * FROM Paradox WHERE name = ?`;
      params = [value];
    }else if(type === 'Biome'){
      sql = `SELECT * FROM Paradox WHERE biome LIKE ?`;
      params = [`%${value}%`];
    }else if(type === 'Time'){
      sql = `SELECT * FROM Paradox WHERE time = ?`;
      params = [value];
    }else if(type === 'Weather'){
      if(value.toLowerCase() === 'rain'){
        sql = `SELECT * FROM Paradox WHERE weather = ? OR weather = ?`;
        params = ['Rain', 'Rain/Storm'];
      }else if(value.toLowerCase() === 'storm'){
        sql = `SELECT * FROM Paradox WHERE weather = ? OR weather = ?`;
        params = ['Storm', 'Rain/Storm'];
      }else{
        sql = `SELECT * FROM Paradox WHERE weather = ?`;
        params = [value];
      }
    }else if(type === 'Condition'){
      sql = `SELECT * FROM Paradox WHERE condition = ?`;
      params = [value];
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }
      res.json(rows);
    });
  });
});

app.get('/ultra', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM UltraBeast order by Name', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }

      res.json(rows);
    });
  });
});

app.get('/beastDetails', (req, res) => {
  const type = req.query.type;
  const value = req.query.value;

  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }

    let sql;
    let params;
    if (type === 'Name') {
      sql = `SELECT * FROM UltraBeast WHERE name = ? order by Name`;
      params = [value];
    } else if (type === 'Biome') {
      sql = `SELECT * FROM UltraBeast WHERE biome LIKE ? order by Name`;
      params = [`%${value}%`];
    }else if (type === 'Condition') {
      sql = `SELECT * FROM Legendarys WHERE condition = ? order by Name`;
      params = [value];
    } else if (type === 'Weather') {
      if (value.toLowerCase() === 'rain') {
        sql = `SELECT * FROM UltraBeast WHERE weather = ? OR weather = ? order by Name`;
        params = ['Rain', 'Rain/Storm'];
      } else if (value.toLowerCase() === 'storm') {
        sql = `SELECT * FROM UltraBeast WHERE weather = ? OR weather = ? order by Name`;
        params = ['Storm', 'Rain/Storm'];
      } else {
        sql = `SELECT * FROM UltraBeast WHERE weather = ? order by Name`;
        params = [value];
      }
    }
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }
    
      res.json(rows);
    });
  });
});

app.get('/data', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM Legendarys order by Name', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }

      res.json(rows);
    });
  });
});

app.get('/pokemon', (req, res) => {
  const type = req.query.type;
  const value = req.query.value;

  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }

    let sql;
    let params;
    if (type === 'Name') {
      sql = `SELECT * FROM Legendarys WHERE name = ? order by Name`;
      params = [value];
    } else if (type === 'Biome') {
      sql = `SELECT * FROM Legendarys WHERE biome LIKE ? order by Name`;
      params = [`%${value}%`];
    } else if (type === 'Time') {
      sql = `SELECT * FROM Legendarys WHERE time = ? order by Name`;
      params = [value];
    } else if (type === 'Weather') {
      if (value.toLowerCase() === 'rain') {
        sql = `SELECT * FROM Legendarys WHERE weather = ? OR weather = ? order by Name`;
        params = ['Rain', 'Rain/Storm'];
      } else if (value.toLowerCase() === 'storm') {
        sql = `SELECT * FROM Legendarys WHERE weather = ? OR weather = ? order by Name`;
        params = ['Storm', 'Rain/Storm'];
      } else {
        sql = `SELECT * FROM Legendarys WHERE weather = ? order by Name`;
        params = [value];
      }
    }else if (type === 'Condition') {
      sql = `SELECT * FROM Legendarys WHERE condition = ? order by Name`;
      params = [value];
    }
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }
    
      res.json(rows);
    });
  });
});

app.get('/pricesLeggy', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM LeggyPrice', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }

      res.json(rows);
    });
  });
});

app.get('/pricesUltra', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM UltraPrice', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }

      res.json(rows);
    });
  });
});

app.get('/pricesPokes', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM PokePrice', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }

      res.json(rows);
    });
  });
});

app.get('/pricesMega', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM MegaStonePrice', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }

      res.json(rows);
    });
  });
});

app.get('/pricesBreed', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM BreedItemPrice', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }

      res.json(rows);
    });
  });
});

app.get('/pricesEvo', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM EvoItemPrice', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }

      res.json(rows);
    });
  });
});

app.get('/pricesZcrys', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM ZCrystal', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }

      res.json(rows);
    });
  });
});

app.get('/pricesMisc', (req, res) => {
  const db = new sqlite3.Database('./app/database/Legendarys.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      res.status(500).send(err);
      return;
    }
    db.all('SELECT * FROM Miscalleanous', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err);
        return;
      }

      res.json(rows);
    });
  });
});

import serverless from "serverless-http";
export default serverless(app);