const winston = require('winston');
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');

const logFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  let metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
});


const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(__dirname, 'logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '30d',
    }),
    new DailyRotateFile({
      filename: path.join(__dirname, 'logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '30d',
    })
  ],
});

// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.simple()
//     )
//   }));
// }

module.exports = logger;
