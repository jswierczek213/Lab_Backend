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
    const query = 'select * from dbo.posts';
    const result = await connectionPool.query(query);
    await connectionPool.close();

    res.status(200).send(result.recordset);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.get('/by-id/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;

    const connectionPool = await sql.connect(sqlConfig);
    const query = `select * from dbo.posts WHERE id_post = ${postId}`;
    const result = await connectionPool.query(query);
    await connectionPool.close();

    res.status(200).send(result.recordset);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.post('/add-post', async (req, res) => {
  try {
    const newPostData = req.body;

    if (isPostDataCorrect(newPostData)) {
      const connectionPool = await sql.connect(sqlConfig);
      const addPostQuery = `insert into dbo.posts (post_title, post_content, post_create_date, id_user, id_category) output inserted.id_post, inserted.post_title, inserted.post_content, inserted.post_create_date, inserted.id_user, inserted.id_category values ('${newPostData.postTitle}', '${newPostData.postContent}', '${newPostData.postCreateDate}', '${newPostData.userId}', '${newPostData.categoryId}')`;
      const result = await connectionPool.query(addPostQuery);
      await connectionPool.close();
  
      res.status(200).send(result.recordset);
    } else {
      const requestBodyAsString = JSON.stringify(newPostData);
      const error = `Error: Expected: { groupName: string } Received: ${requestBodyAsString}`;
      res.status(400).send(error);
    }

  } catch (e) {
    res.status(500).send(e.toString());
  }
});

router.patch('/change-category', async (req, res) => {
  try {
    const postId = req.query.postId;
    const categoryId = req.query.categoryId;

    const changeCategoryQuery = `update dbo.posts set id_category = '${categoryId}' where id_post = ${postId}`;

    const connectionPool = await sql.connect(sqlConfig);
    await connectionPool.query(changeCategoryQuery);
    await connectionPool.close();

    res.status(200).send('Category of post has been changed');
  } catch(e) {
    res.status(500).send(e.toString());
  }
});

router.delete('/delete-post/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;

    const connectionPool = await sql.connect(sqlConfig);
    const query = `delete from dbo.posts output deleted.id_post, deleted.post_title, deleted.post_content, deleted.post_create_date, deleted.id_user, deleted.id_category where id_post = ${postId}`;
    const result = await connectionPool.query(query);
    await connectionPool.close();

    if (result.recordset.length > 0) {
      const deletedPostAsString = JSON.stringify(result.recordset[0]);
      res.status(200).send(`Deleted post: ${deletedPostAsString}`);
    } else {
      res.status(200).send('The post with a given id does not exist');
    }

  } catch (e) {
    res.status(500).send(e.toString());
  }
});

const isPostDataCorrect = (data) => {
  if (
    data.postTitle && typeof data.postTitle === 'string' && 
    data.postContent && typeof data.postContent === 'string' && 
    data.postCreateDate &&  typeof data.postCreateDate === 'string' && 
    data.userId && typeof data.userId === 'number' && 
    data.categoryId && typeof data.categoryId === 'number'
  ) return true 
  else return false;
}

export default router;