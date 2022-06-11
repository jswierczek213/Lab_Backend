import express from "express";

const router = express.Router();

// Database Connection Config
import { sqlConfig } from "../../database/database-config.mjs";

// Database Engine Initialization
import sql from 'mssql';

router.get('/all', async (req, res) => {
  try {
    const connectionPool = await sql.connect(sqlConfig);
    const query = 'select * from dbo.users';
    const result = await connectionPool.query(query);
    await connectionPool.close();

    res.status(200).send(result.recordset);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.get('/by-id/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const connectionPool = await sql.connect(sqlConfig);
    const query = `select * from dbo.users WHERE id_user = ${userId}`;
    const result = await connectionPool.query(query);
    await connectionPool.close();

    res.status(200).send(result.recordset);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.get('/inside-group/:groupId', async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const connectionPool = await sql.connect(sqlConfig);
    const query = `select * from dbo.users WHERE id_group = ${groupId}`;
    const result = await connectionPool.query(query);
    await connectionPool.close();

    res.status(200).send(result.recordset);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.post('/add-user', async (req, res) => {
  try {
    const newUserData = req.body;

    if (isUserDataCorrect(newUserData)) {
      const connectionPool = await sql.connect(sqlConfig);
      const addUserQuery = `insert into dbo.users (firstname, lastname, date_of_birth, gender, id_group) output inserted.id_user, inserted.firstname, inserted.lastname, inserted.date_of_birth, inserted.gender, inserted.id_group values ('${newUserData.firstName}', '${newUserData.lastName}', '${newUserData.dateOfBirth}', '${newUserData.gender}', ${newUserData.groupId})`;
      const result = await connectionPool.query(addUserQuery);
      await connectionPool.close();
  
      res.status(200).send(result.recordset);
    } else {
      const requestBodyAsString = JSON.stringify(newUserData);
      const error = `Error: Expected: { firstName: string, lastName: string, dateOfBirth: string, gender: string, groupId: number } Received: ${requestBodyAsString}`;
      res.status(400).send(error);
    }

  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.patch('/change-group', async (req, res) => {
  try {
    const groupId = req.query.groupId;
    const userId = req.query.userId;

    const changeGroupQuery = `update dbo.users set id_group = ${groupId} where id_user = ${userId}`;

    const connectionPool = await sql.connect(sqlConfig);
    await connectionPool.query(changeGroupQuery);
    await connectionPool.close();

    res.status(200).send('Group has been changed');
  } catch(e) {
    res.status(500).send(e.toString());
  }
});

router.delete('/delete-user/:userId', async (req, res) => {
  try {
    const userId = req.params.groupId;

    const connectionPool = await sql.connect(sqlConfig);
    const query = `delete from dbo.users output deleted.id_user, deleted.firstname, deleted.lastname, deleted.date_of_birth, deleted.gender, deleted.id_group where id_user = ${userId}`;
    const result = await connectionPool.query(query);
    await connectionPool.close();

    if (result.recordset.length > 0) {
      const deletedUserAsString = JSON.stringify(result.recordset[0]);
      res.status(200).send(`Deleted user: ${deletedUserAsString}`);
    } else {
      res.status(200).send('The user with a given id does not exist');
    }

  } catch (e) {
    res.status(500).send(e.toString());
  }
});

const isUserDataCorrect = (data) => {
  if (
    data.firstName && typeof data.firstName === 'string' && 
    data.lastName && typeof data.lastName === 'string' && 
    data.dateOfBirth &&  typeof data.dateOfBirth === 'string' && 
    data.gender && typeof data.gender === 'string' && 
    data.groupId && typeof data.groupId === 'number'
  ) return true 
  else return false;
}

export default router;