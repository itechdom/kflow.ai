import path from 'path';
import { config } from 'dotenv';
import app from './app';

config({ path: path.resolve(__dirname, '..', '.env') });

const port: number = parseInt(process.env.PORT || '3001', 10);

app.listen(port, () => {
  console.log(`KFlow server running on port ${port}`);
  console.log(
    `AI Note Generation: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Disabled (No API Key)'}`
  );
});

