const dotenv = require('dotenv').config();

// ============================
//  App
// ============================
process.env.APP_DOMAIN = process.env.APP_DOMAIN || 'localhost:4200';
process.env.APP_SUBDOMAIN = process.env.APP_SUBDOMAIN || '';

// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 3000;

// ============================
//  Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ============================
//  Token
// ============================
process.env.JWT_KEY = process.env.SEED || 'KeyLlave';
process.env.JWT_LIFE = '48h';

// ============================
//  Icecast
// ============================
process.env.ICE_HOST = process.env.ICE_HOST || 'localhost';
process.env.ICE_PORT = process.env.ICE_PORT || 8000;
process.env.ICE_USER = process.env.ICE_USER || 'source';
process.env.ICE_PASSWORD = process.env.ICE_PASSWORD || 'hackme';
process.env.ICE_MOUNT = process.env.ICE_MOUNT || 'stream';
process.env.ICE_FORMAT = process.env.ICE_FORMAT || 1; // 0=ogg, 1=mp3
process.env.ICE_BITRATE = process.env.ICE_BITRATE || '192';
process.env.ICE_SAMPLERATE = process.env.ICE_SAMPLERATE || '44100';
process.env.ICE_CHANNELS = process.env.ICE_CHANNELS || '2';
process.env.ICE_SOURCE_TIMEOUT = process.env.ICE_SOURCE_TIMEOUT || 30;
process.env.ICE_BURST_SIZE = process.env.ICE_BURST_SIZE || 131072;

// ============================
//  Base de datos
// ============================
process.env.DB_URL = process.env.DB_URL || 'mongodb://localhost/radio';

// ============================
//  Socket Server
// ============================
process.env.SOCKET_HOST = process.env.SOCKET_HOST || 'https://wsmcuevapps.herokuapp.com';