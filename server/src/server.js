const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('./app');

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`KFlow server running on port ${port}`);
  console.log(`AI Note Generation: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Disabled (No API Key)'}`);
});


