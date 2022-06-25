import express from "express";
import amqp from 'amqplib';

const router = express.Router();

router.post('/publish-numbers', async (req, res) => {
  const numbers = req.body.numbers;

  try {
      const connection = await amqp.connect("amqp://localhost:5672");
      const channel = await connection.createChannel();
      await channel.assertQueue("odd");
      await channel.assertQueue("even");

      console.log('Start publishing');
      
      numbers.forEach(async num => {
        const queueName = parseInt(num) % 2 ? "odd" : "even";
        console.log(`Publishing number: ${num} to queueName: ${queueName}`);
        await channel.sendToQueue(queueName, Buffer.from(JSON.stringify({ number: num })));
      });

      console.log('End publishing');

      await channel.close();
      await connection.close();

      res.status(200).send('Numbers has been sent');
  }
  catch (ex) {
      res.status(400).send('Bad request');
      console.error(ex);
  }

});

export default router;