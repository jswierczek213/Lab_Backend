import express from "express";

const router = express.Router();

// Database Connection Config
const sqlConfig = {
  server: process.env.DB_SERVER,
  database: 'lab_backend',
  user: process.env.DB_LOGIN,
  password: process.env.DB_PASSWORD,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 5000
  },
  options: {
    trustServerCertificate: true
  }
}

// Database Engine Initialization
import sql from 'mssql';

router.get('/all', async (req, res) => {
  try {
    const connectionPool = await sql.connect(sqlConfig);
    const query = 'select * from dbo.categories';
    const result = await connectionPool.query(query);
    await connectionPool.close();

    res.status(200).send(result.recordset);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.get('/by-id/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const connectionPool = await sql.connect(sqlConfig);
    const query = `select * from dbo.categories WHERE id_category = ${categoryId}`;
    const result = await connectionPool.query(query);
    await connectionPool.close();

    res.status(200).send(result.recordset);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.post('/add-category', async (req, res) => {
  try {
    const newCategoryData = req.body;

    if (
      newCategoryData.categoryName !== undefined &&
      newCategoryData.categoryName !== null &&
      typeof newCategoryData.categoryName === 'string'
    ) {
      const connectionPool = await sql.connect(sqlConfig);
      const addCategoryQuery = `insert into dbo.categories (category_name) output inserted.id_category, inserted.category_name values ('${newCategoryData.categoryName}')`;
      const result = await connectionPool.query(addCategoryQuery);
      await connectionPool.close();
  
      res.status(200).send(result.recordset);
    } else {
      const requestBodyAsString = JSON.stringify(newCategoryData);
      const error = `Error: Expected: { categoryName: string } Received: ${requestBodyAsString}`;
      res.status(400).send(error);
    }

  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.patch('/change-name', async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    const categoryName = req.query.categoryName;

    const changeNameQuery = `update dbo.categories set category_name = '${categoryName}' where id_category = ${categoryId}`;

    const connectionPool = await sql.connect(sqlConfig);
    await connectionPool.query(changeNameQuery);
    await connectionPool.close();

    res.status(200).send('Category name has been changed');
  } catch(e) {
    res.status(500).send(e.toString());
  }
});

router.delete('/delete-category/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const connectionPool = await sql.connect(sqlConfig);
    const query = `delete from dbo.categories output deleted.id_category, deleted.category_name where id_category = ${categoryId}`;
    const result = await connectionPool.query(query);
    await connectionPool.close();

    if (result.recordset.length > 0) {
      const deletedCategoryAsString = JSON.stringify(result.recordset[0]);
      res.status(200).send(`Deleted category: ${deletedCategoryAsString}`);
    } else {
      res.status(200).send('The category with a given id does not exist');
    }

  } catch (e) {
    res.status(500).send(e.toString());
  }
});

export default router;