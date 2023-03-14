import dotenv from 'dotenv';
dotenv.config();

export default {
  cookie_jwt: {
    JWT_SECRET: process.env.JWT_SECRET,
    COOKIE_SECRET_KEY_ONE: process.env.COOKIE_SECRET_KEY_ONE,
    COOKIE_SECRET_KEY_TWO: process.env.COOKIE_SECRET_KEY_TWO
  },

  email: {
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM
  },
  session: {
    SESSION_SECRET: process.env.SESSION_SECRET
  },
  redis: {
    REDIS_HOST: 'redis://localhost:6379'
  }
};
