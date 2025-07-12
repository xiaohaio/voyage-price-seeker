import axios from 'axios';
import type { Destination, Hotel, HotelPrice, Room, SearchParams, BookingData, Booking } from '@/types';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Destinations
export const loadDestinations = async (): Promise<Destination[]> => {
  const response = await fetch('/destinations.json');
  return response.json();
};

// Hotels
export const getHotels = async (destination_id: string): Promise<Hotel[]> => {
  const response = await api.get('/hotels', {
    params: { destination_id }
  });
  return response.data;
};

export const getHotelDetails = async (hotelId: string): Promise<Hotel> => {
  const response = await api.get(`/hotels/${hotelId}`);
  return response.data;
};

// Prices
export const getHotelPrices = async (params: SearchParams): Promise<HotelPrice[]> => {
  const response = await api.get('/hotels/prices', { params });
  return response.data;
};

export const getHotelRoomPrices = async (hotelId: string, params: Omit<SearchParams, 'destination_id'>): Promise<{ rooms: Room[] }> => {
  const response = await api.get(`/hotels/${hotelId}/prices`, { params });
  return response.data;
};

// Bookings
export const createBooking = async (bookingData: BookingData): Promise<{ success: boolean; booking: Booking }> => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// Utility functions
export const formatGuests = (adults: number, children: number, rooms: number): string => {
  const guestsPerRoom = Math.ceil((adults + children) / rooms);
  return Array(rooms).fill(guestsPerRoom).join('|');
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};