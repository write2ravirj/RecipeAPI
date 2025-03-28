const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to SQLite database');

  db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS recipes`);

    db.run(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        making_time TEXT NOT NULL,
        serves TEXT NOT NULL,
        ingredients TEXT NOT NULL,
        cost INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      INSERT INTO recipes (
        id, title, making_time, serves, ingredients, cost, created_at, updated_at
      ) VALUES (
        1,
        'Chicken Curry',
        '45 min',
        '4 people',
        'onion, chicken, seasoning',
        1000,
        '2016-01-10 12:10:12',
        '2016-01-10 12:10:12'
      )
    `);

    db.run(`
      INSERT INTO recipes (
        id, title, making_time, serves, ingredients, cost, created_at, updated_at
      ) VALUES (
        2,
        'Rice Omelette',
        '30 min',
        '2 people',
        'onion, egg, seasoning, soy sauce',
        700,
        '2016-01-11 13:10:12',
        '2016-01-11 13:10:12'
      )
    `);
  });
});

// Create a new recipe
app.post('/recipes', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;

  // Fixed: always return 200 even if required fields are missing
  if (!title || !making_time || !serves || !ingredients || !cost) {
    return res.status(200).json({
      message: "Recipe creation failed!",
      required: "title, making_time, serves, ingredients, cost"
    });
  }

  const sql = `
    INSERT INTO recipes (title, making_time, serves, ingredients, cost)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [title, making_time, serves, ingredients, cost], function(err) {
    if (err) {
      return res.status(200).json({ message: "Recipe creation failed!" });
    }

    db.get(`SELECT * FROM recipes WHERE id = ?`, [this.lastID], (err, recipe) => {
      if (err) {
        return res.status(200).json({ message: "Recipe creation failed!" });
      }

      res.status(200).json({
        message: "Recipe successfully created!",
        recipe: [recipe] // wrapped in array
      });
    });
  });
});

// Get all recipes
app.get('/recipes', (req, res) => {
  db.all('SELECT * FROM recipes', [], (err, recipes) => {
    if (err) {
      return res.status(500).json({ message: "Failed to retrieve recipes" });
    }
    res.status(200).json({ recipes });
  });
});

// Get recipe by ID
app.get('/recipes/:id', (req, res) => {
  db.get('SELECT * FROM recipes WHERE id = ?', [req.params.id], (err, recipe) => {
    if (err || !recipe) {
      return res.status(404).json({ message: "No recipe found" });
    }
    res.status(200).json({
      message: "Recipe details by id",
      recipe: [recipe] // wrapped in array
    });
  });
});

// Update recipe
app.patch('/recipes/:id', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;
  const updates = [];
  const values = [];

  if (title) { updates.push('title = ?'); values.push(title); }
  if (making_time) { updates.push('making_time = ?'); values.push(making_time); }
  if (serves) { updates.push('serves = ?'); values.push(serves); }
  if (ingredients) { updates.push('ingredients = ?'); values.push(ingredients); }
  if (cost) { updates.push('cost = ?'); values.push(cost); }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No fields provided to update." });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);

  const sql = `
    UPDATE recipes
    SET ${updates.join(', ')}
    WHERE id = ?
  `;

  db.run(sql, values, function(err) {
    if (err || this.changes === 0) {
      return res.status(404).json({ message: "No recipe found" });
    }

    db.get('SELECT * FROM recipes WHERE id = ?', [req.params.id], (err, recipe) => {
      if (err) {
        return res.status(500).json({ message: "Failed to retrieve updated recipe" });
      }
      res.status(200).json({
        message: "Recipe successfully updated!",
        recipe: recipe
      });
    });
  });
});

// Delete recipe
app.delete('/recipes/:id', (req, res) => {
  db.run('DELETE FROM recipes WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: "Failed to delete recipe" });
    }
    res.status(200).json({ message: "Recipe successfully removed!" });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Recipe API server running at http://localhost:${port}`);
});
