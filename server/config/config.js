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
process.env.ICE_PORT = process.env.ICE_HOST || 8000;
process.env.ICE_USER = process.env.ICE_USER || 'source';
process.env.ICE_PASSWORD = process.env.ICE_PASSWORD || '123456';
process.env.ICE_MOUNT = process.env.ICE_MOUNT || 'radio';
process.env.ICE_FORMAT = process.env.ICE_FORMAT || 1; // 0=ogg, 1=mp3
process.env.ICE_BITRATE = process.env.ICE_PASSWORD || '192';
process.env.ICE_SAMPLERATE = process.env.ICE_PASSWORD || '44100';
process.env.ICE_CHANNELS = process.env.ICE_PASSWORD || '2';

// ============================
//  Base de datos
// ============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost/radio';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;