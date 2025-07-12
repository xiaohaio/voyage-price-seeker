import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

const API_BASE_URL = 'https://hotelapi.loyalty.dev';

// Utility function to handle API requests
const makeApiRequest = async (endpoint, params = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error.message);
    throw error;
  }
};

// Routes

// Get hotel prices for a destination
app.get('/api/hotels/prices', async (req, res) => {
  try {
    const data = await makeApiRequest('/api/hotels/prices', req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotel prices', details: error.message });
  }
});

// Get price for a specific hotel
app.get('/api/hotels/:id/prices', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await makeApiRequest(`/api/hotels/${id}/prices`, req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotel price', details: error.message });
  }
});

// Get hotels for a destination
app.get('/api/hotels', async (req, res) => {
  try {
    const data = await makeApiRequest('/api/hotels', req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotels', details: error.message });
  }
});

// Get specific hotel details
app.get('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await makeApiRequest(`/api/hotels/${id}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotel details', details: error.message });
  }
});

// Mock booking endpoint
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // In a real application, you would save this to a database
    // For now, we'll just return a mock booking confirmation
    const booking = {
      id: `BK${Date.now()}`,
      ...bookingData,
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
    };
    
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;