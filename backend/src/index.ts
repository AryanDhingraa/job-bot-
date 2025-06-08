import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import authRoutes from './routes/auth';
import candidateRoutes from './routes/candidate';
import lecturerRoutes from './routes/lecturer';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/candidate', candidateRoutes);
    app.use('/api/lecturer', lecturerRoutes);
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  }); 