module.exports = process.env.POMELO_COV ?
  require('./lib-cov/pomelo') :
  require('./lib/pomelo');