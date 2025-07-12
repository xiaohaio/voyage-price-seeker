import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Wifi, Car, Utensils, Waves, Users, Calendar, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getHotelDetails, getHotelRoomPrices } from '@/services/api';
import type { Hotel, Room } from '@/types';

const HotelDetails = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
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
    const loadHotelData = async () => {
      if (!hotelId) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Load hotel details and room prices in parallel
        const [hotelData, roomsData] = await Promise.all([
          getHotelDetails(hotelId),
          getHotelRoomPrices(hotelId, {
            checkin: searchOptions.checkin,
            checkout: searchOptions.checkout,
            lang: 'en_US',
            currency: 'SGD',
            country_code: 'SG',
            guests: searchOptions.guests,
            partner_id: 1,
          })
        ]);

        setHotel(hotelData);
        setRooms(roomsData.rooms || []);
      } catch (err) {
        console.error('Failed to load hotel details:', err);
        setError('Failed to load hotel details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadHotelData();
  }, [hotelId, searchParams]);

  const handleRoomSelect = (roomKey: string) => {
    const bookingParams = new URLSearchParams({
      hotelId: hotelId!,
      roomKey,
      ...searchOptions,
    } as any);
    navigate(`/booking?${bookingParams.toString()}`);
  };

  const renderStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-warning fill-warning' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return Wifi;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('car')) return Car;
    if (lowerAmenity.includes('restaurant') || lowerAmenity.includes('dining')) return Utensils;
    if (lowerAmenity.includes('pool') || lowerAmenity.includes('spa')) return Waves;
    return null;
  };

  const getImageUrl = (hotel: Hotel, imageIndex: number = 1) => {
    if (hotel.image_details && hotel.image_details.prefix) {
      return `${hotel.image_details.prefix}${imageIndex}${hotel.image_details.suffix}`;
    }
    return `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error || 'Hotel not found'}</p>
          <Button onClick={() => navigate(-1)} variant="travel">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
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
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Results
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
        {/* Hotel Header */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Image */}
            <div className="lg:col-span-2">
              <img
                src={getImageUrl(hotel)}
                alt={hotel.name}
                className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-travel"
                onError={(e) => {
                  e.currentTarget.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop`;
                }}
              />
            </div>
            
            {/* Hotel Info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {renderStarRating(hotel.rating)}
                  <Badge variant="secondary">{hotel.rating} Star Hotel</Badge>
                </div>
                <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{hotel.address}</span>
                </div>
              </div>

              {/* Search Details */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{searchOptions.checkin} - {searchOptions.checkout}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        {searchOptions.adults} adults
                        {searchOptions.children > 0 && `, ${searchOptions.children} children`}
                        • {searchOptions.rooms} room{searchOptions.rooms > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              {hotel.categories && hotel.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hotel.categories.map((category, index) => (
                    <Badge key={index} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {hotel.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Hotel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {hotel.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotel.amenities.map((amenity, index) => {
                      const IconComponent = getAmenityIcon(amenity);
                      return (
                        <div key={index} className="flex items-center gap-3">
                          {IconComponent ? (
                            <IconComponent className="w-5 h-5 text-primary" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-primary/20" />
                          )}
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Rooms */}
            <Card>
              <CardHeader>
                <CardTitle>Available Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                {rooms.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No rooms available for your selected dates.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rooms.map((room, index) => (
                      <Card key={index} className="border">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">
                                {room.room_normalized_description}
                              </h3>
                              {room.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {room.description}
                                </p>
                              )}
                              
                              {room.amenities && room.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {room.amenities.slice(0, 3).map((amenity, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                  {room.amenities.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{room.amenities.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                              
                              {room.free_cancellation && (
                                <Badge variant="success" className="mt-2">
                                  Free Cancellation
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary mb-2">
                                ${room.price}
                              </div>
                              <p className="text-sm text-muted-foreground mb-4">per night</p>
                              <Button
                                onClick={() => handleRoomSelect(room.key)}
                                variant="travel"
                                size="lg"
                              >
                                Select Room
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Map view would show here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Lat: {hotel.latitude}, Lng: {hotel.longitude}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span>{searchOptions.checkin}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span>{searchOptions.checkout}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests</span>
                  <span>{searchOptions.adults + searchOptions.children}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rooms</span>
                  <span>{searchOptions.rooms}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HotelDetails;