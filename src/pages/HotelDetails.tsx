import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Wifi, Car, Utensils, Waves, Users, Calendar, Plane, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getHotelRoomPrices } from '@/services/api';

const HotelDetails = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [hotelData, setHotelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract search parameters
  const searchOptions = {
    destination_id: searchParams.get('destination_id') || '',
    checkin: searchParams.get('checkin') || '',
    checkout: searchParams.get('checkout') || '',
    guests: searchParams.get('guests') || '',
    lang: searchParams.get('lang') || 'en_US',
    currency: searchParams.get('currency') || 'SGD',
    country_code: searchParams.get('country_code') || 'SG',
    partner_id: searchParams.get('partner_id') || '1',
  };

  // Parse guests to get adults/children/rooms info
  const parseGuests = (guestsString: string) => {
    const guestCounts = guestsString.split('|').map(g => parseInt(g));
    const totalGuests = guestCounts.reduce((sum, count) => sum + count, 0);
    const roomCount = guestCounts.length;
    return { totalGuests, roomCount };
  };

  const { totalGuests, roomCount } = parseGuests(searchOptions.guests);

  useEffect(() => {
    const loadHotelData = async () => {
      if (!hotelId) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Load hotel room prices which contains all the detailed info
        const roomsData = await getHotelRoomPrices(hotelId, {
          checkin: searchOptions.checkin,
          checkout: searchOptions.checkout,
          lang: searchOptions.lang,
          currency: searchOptions.currency,
          country_code: searchOptions.country_code,
          guests: searchOptions.guests,
          partner_id: parseInt(searchOptions.partner_id),
        });

        setHotelData(roomsData);
      } catch (err) {
        console.error('Failed to load hotel details:', err);
        setError('Failed to load hotel details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadHotelData();
  }, [hotelId, searchParams]);

  const handleRoomSelect = (roomKey: string, roomPrice: number) => {
    const bookingParams = new URLSearchParams({
      hotelId: hotelId!,
      roomKey,
      price: roomPrice.toString(),
      checkin: searchOptions.checkin,
      checkout: searchOptions.checkout,
      guests: searchOptions.guests,
      currency: searchOptions.currency,
    });
    navigate(`/booking?${bookingParams.toString()}`);
  };

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return Wifi;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('car')) return Car;
    if (lowerAmenity.includes('restaurant') || lowerAmenity.includes('dining')) return Utensils;
    if (lowerAmenity.includes('pool') || lowerAmenity.includes('spa')) return Waves;
    return null;
  };

  const renderRoomDescription = (description: string) => {
    if (!description) return null;
    
    // Parse HTML and extract key information
    const parser = new DOMParser();
    const doc = parser.parseFromString(description, 'text/html');
    const text = doc.body.textContent || '';
    
    // Extract key features
    const features = [];
    if (text.includes('WiFi')) features.push('Free WiFi');
    if (text.includes('Air conditioning')) features.push('Air Conditioning');
    if (text.includes('TV')) features.push('Smart TV');
    if (text.includes('Private bathroom')) features.push('Private Bathroom');
    
    return features;
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

  if (error || !hotelData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error || 'Hotel not found'}</p>
          <Button onClick={() => navigate(-1)} variant="default">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const rooms = hotelData.rooms || [];
  const firstRoom = rooms[0];

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
              {firstRoom?.images && firstRoom.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  <img
                    src={firstRoom.images[0].high_resolution_url || firstRoom.images[0].url}
                    alt="Hotel room"
                    className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-travel col-span-2"
                    onError={(e) => {
                      e.currentTarget.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop`;
                    }}
                  />
                  {firstRoom.images.slice(1, 3).map((image, index) => (
                    <img
                      key={index}
                      src={image.high_resolution_url || image.url}
                      alt={`Hotel view ${index + 2}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop`;
                      }}
                    />
                  ))}
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop"
                  alt="Hotel"
                  className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-travel"
                />
              )}
            </div>
            
            {/* Hotel Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Hotel Details</h1>
                <p className="text-muted-foreground">Hotel ID: {hotelId}</p>
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
                        {totalGuests} guests • {roomCount} room{roomCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    {hotelData.completed ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm">
                      Search {hotelData.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  {hotelData.currency && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Prices in {hotelData.currency}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
                  <div className="space-y-6">
                    {rooms.map((room: any, index: number) => (
                      <Card key={room.key || index} className="border">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Room Image */}
                            <div className="lg:col-span-1">
                              {room.images && room.images.length > 0 ? (
                                <img
                                  src={room.images[0].high_resolution_url || room.images[0].url}
                                  alt={room.roomNormalizedDescription}
                                  className="w-full h-32 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop`;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                                  <span className="text-muted-foreground text-sm">No image</span>
                                </div>
                              )}
                            </div>

                            {/* Room Details */}
                            <div className="lg:col-span-2">
                              <h3 className="font-semibold text-lg mb-2">
                                {room.roomNormalizedDescription || room.roomDescription || 'Room'}
                              </h3>
                              
                              {room.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {room.description}
                                </p>
                              )}

                              {/* Room Features from long_description */}
                              {room.long_description && (
                                <div className="mb-3">
                                  {renderRoomDescription(room.long_description)?.map((feature, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs mr-2 mb-1">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Amenities */}
                              {room.amenities && room.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {room.amenities.slice(0, 4).map((amenity: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                  {room.amenities.length > 4 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{room.amenities.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Cancellation Policy */}
                              <div className="flex items-center gap-2">
                                {room.free_cancellation ? (
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                    Free Cancellation
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    Non-refundable
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Pricing */}
                            <div className="lg:col-span-1 text-right">
                              <div className="mb-4">
                                <div className="text-2xl font-bold text-primary mb-1">
                                  {room.currency === 'SGD' ? 'S$' : '$'}{room.converted_price || room.price}
                                </div>
                                <p className="text-sm text-muted-foreground">per night</p>
                                
                                {room.included_taxes_and_fees_total_in_currency && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    +{room.currency === 'SGD' ? 'S$' : '$'}{room.included_taxes_and_fees_total_in_currency} taxes
                                  </p>
                                )}
                              </div>
                              
                              <Button
                                onClick={() => handleRoomSelect(room.key, room.converted_price || room.price)}
                                className="w-full"
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
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
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
                  <span>{totalGuests}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rooms</span>
                  <span>{roomCount}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency</span>
                  <span>{searchOptions.currency}</span>
                </div>
              </CardContent>
            </Card>

            {/* Hotel Policies */}
            {firstRoom?.roomAdditionalInfo?.displayFields && (
              <Card>
                <CardHeader>
                  <CardTitle>Hotel Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {firstRoom.roomAdditionalInfo.displayFields.special_check_in_instructions && (
                    <div>
                      <h4 className="font-medium mb-1">Check-in Instructions</h4>
                      <p className="text-muted-foreground text-xs">
                        {firstRoom.roomAdditionalInfo.displayFields.special_check_in_instructions}
                      </p>
                    </div>
                  )}
                  
                  {firstRoom.roomAdditionalInfo.displayFields.fees_mandatory && (
                    <div>
                      <h4 className="font-medium mb-1">Additional Fees</h4>
                      <div 
                        className="text-muted-foreground text-xs"
                        dangerouslySetInnerHTML={{ 
                          __html: firstRoom.roomAdditionalInfo.displayFields.fees_mandatory 
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HotelDetails;