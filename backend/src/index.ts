/**
 * Entry point for MNEMOS backend
 */

import app from './api';

// Start the server when this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`MNEMOS API server running on port ${PORT}`);
  });
}

