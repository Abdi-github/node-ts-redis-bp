export default {
  server: {
    port: 1338,
    zz: 'PROD',
    CLIENT_URL: 'http://localhost:4000'
  },
  db: {
    DB_URL: process.env.DATABASE_URL
  }
};
