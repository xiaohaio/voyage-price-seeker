// Types for the hotel booking application

export interface Destination {
  uid: string;
  term: string;
  lat: number;
  lng: number;
  state: string;
  type: string;
}

export interface Hotel {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  rating: number;
  categories: string[];
  description: string;
  amenities: string[];
  image_details: {
    prefix: string;
    suffix: string;
    count: number;
  };
}

export interface HotelPrice {
  id: string;
  searchRank: number;
  price: number;
  market_rates: MarketRate[];
}

export interface MarketRate {
  supplier: string;
  price: number;
}

export interface Room {
  key: string;
  room_normalized_description: string;
  free_cancellation: boolean;
  description: string;
  long_description: string;
  images: string[];
  amenities: string[];
  price: number;
  market_rates: MarketRate[];
}

export interface SearchParams {
  destination_id: string;
  checkin: string;
  checkout: string;
  lang: string;
  currency: string;
  country_code: string;
  guests: string;
  partner_id: number;
}

export interface BookingData {
  hotelId: string;
  roomKey: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    billingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
}

export interface Booking {
  id: string;
  hotelId: string;
  roomKey: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  totalPrice: number;
  status: string;
  bookingDate: string;
}

export interface FilterOptions {
  starRating: number[];
  guestRating: number[];
  priceRange: [number, number];
}

export interface SortOption {
  value: string;
  label: string;
}