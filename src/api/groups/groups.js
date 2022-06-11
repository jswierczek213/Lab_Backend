import express from "express";

const router = express.Router();

// Database Connection Config
import { sqlConfig } from "../../database/database-config.mjs";

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

router.get('/by-id/:groupId', async (req, res) => {
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

router.patch('/change-name', async (req, res) => {
  try {
    const groupId = req.query.groupId;
    const groupName = req.query.groupName;

    const changeNameQuery = `update dbo.groups set group_name = '${groupName}' where id_group = ${groupId}`;

    const connectionPool = await sql.connect(sqlConfig);
    await connectionPool.query(changeNameQuery);
    await connectionPool.close();

    res.status(200).send('Group name has been changed');
  } catch(e) {
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