import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HotelResults } from '@/components/HotelResults';
import { DestinationSearch } from '@/components/DestinationSearch';
import { getHotels, getHotelPrices } from '@/services/api';
import type { Hotel, HotelPrice } from '@/types';

const Hotels = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [prices, setPrices] = useState<HotelPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract search parameters
  const searchOptions = {
    destination_id: searchParams.get('destination_id') || '',
    checkin: searchParams.get('checkin') || '',
    checkout: searchParams.get('checkout') || '',
    guests: searchParams.get('guests') || '',
    rooms: parseInt(searchParams.get('rooms') || '1'),
    adults: parseInt(searchParams.get('adults') || '2'),
    children: parseInt(searchParams.get('children') || '0'),
  };

  useEffect(() => {
    const loadHotelsData = async () => {
      if (!searchOptions.destination_id) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Load hotels and prices in parallel
        const [hotelsData, pricesData] = await Promise.all([
          getHotels(searchOptions.destination_id),
          getHotelPrices({
            destination_id: searchOptions.destination_id,
            checkin: searchOptions.checkin,
            checkout: searchOptions.checkout,
            lang: 'en_US',
            currency: 'SGD',
            country_code: 'SG',
            guests: searchOptions.guests,
            partner_id: 1,
          })
        ]);

        setHotels(hotelsData);
        setPrices(pricesData);
      } catch (err) {
        console.error('Failed to load hotels:', err);
        setError('Failed to load hotels. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadHotelsData();
  }, [searchParams]);

  const handleNewSearch = (params: {
    destination_id: string;
    checkin: string;
    checkout: string;
    guests: string;
    rooms: number;
    adults: number;
    children: number;
  }) => {
    const newSearchParams = new URLSearchParams(params as any);
    navigate(`/hotels?${newSearchParams.toString()}`);
  };

  const handleHotelSelect = (hotelId: string) => {
    const hotelParams = new URLSearchParams({
      hotelId,
      ...searchOptions,
    } as any);
    navigate(`/hotel/${hotelId}?${hotelParams.toString()}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/')} variant="travel">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="hidden md:flex"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Search
              </Button>
              
              <div className="flex items-center gap-2">
                <Plane className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TravelBooking
                </span>
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* New Search Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6">Search Hotels</h1>
          <DestinationSearch onSearch={handleNewSearch} />
        </div>

        {/* Results Section */}
        <HotelResults
          hotels={hotels}
          prices={prices}
          loading={loading}
          searchParams={searchOptions}
          onHotelSelect={handleHotelSelect}
        />
      </main>
    </div>
  );
};

export default Hotels;