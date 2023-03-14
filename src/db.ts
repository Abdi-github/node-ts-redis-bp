import mongoose from 'mongoose';
import config from 'config';
import logger from '@global/helpers/logger';

const dbConnection = () => {
  const connect = () => {
    mongoose
      .connect(`${config.get('db.DB_URL')}`)
      .then(() => {
        logger.info(`${config.get('db.DB_URL')} Successfully connected to database.`);
        // redisConnection.connect();
      })
      .catch((error) => {
        logger.error('Error connecting to database', error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};

export default dbConnection;
