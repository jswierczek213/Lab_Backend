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
    const query = 'select * from dbo.groups';
    const result = await connectionPool.query(query);
    await connectionPool.close();

    res.status(200).send(result.recordset);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.get('/:groupId', async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const connectionPool = await sql.connect(sqlConfig);
    const query = `select * from dbo.groups WHERE id_group = ${groupId}`;
    const result = await connectionPool.query(query);
    await connectionPool.close();

    res.status(200).send(result.recordset);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.post('/add-group', async (req, res) => {
  try {
    const newGroupData = req.body;

    if (
      newGroupData.groupName !== undefined &&
      newGroupData.groupName !== null &&
      typeof newGroupData.groupName === 'string'
    ) {
      const connectionPool = await sql.connect(sqlConfig);
      const addGroupQuery = `insert into dbo.groups (group_name) output inserted.id_group, inserted.group_name values ('${newGroupData.groupName}')`;
      const result = await connectionPool.query(addGroupQuery);
      await connectionPool.close();
  
      res.status(200).send(result.recordset);
    } else {
      const requestBodyAsString = JSON.stringify(newGroupData);
      const error = `Error: Expected: { groupName: string } Received: ${requestBodyAsString}`;
      res.status(400).send(error);
    }

  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.delete('/delete-group/:groupId', async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const connectionPool = await sql.connect(sqlConfig);
    const query = `delete from dbo.groups output deleted.id_group, deleted.group_name where id_group = ${groupId}`;
    const result = await connectionPool.query(query);
    await connectionPool.close();

    if (result.recordset.length > 0) {
      const deletedGroupAsString = JSON.stringify(result.recordset[0]);
      res.status(200).send(`Deleted group: ${deletedGroupAsString}`);
    } else {
      res.status(200).send('The group with a given id does not exist');
    }

  } catch (e) {
    res.status(500).send(e.toString());
  }
});

export default router;