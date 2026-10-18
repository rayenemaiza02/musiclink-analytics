import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/index.js';
import musicLinksRouter from './routes/musicLinks.js';
import externalRouter from './routes/external.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes de l'API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MusicLink API is running' });
});

// Brancher les routes MusicLinks
app.use('/api/music-links', musicLinksRouter);

// Brancher les routes Spotify & Soundcharts
app.use('/api', externalRouter);

// Démarrage du serveur
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur lors de l\'initialisation de la base :', err);
  });