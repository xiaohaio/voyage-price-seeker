import React from 'react';
import { Star, MapPin, Wifi, Car, Utensils, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Hotel, HotelPrice } from '@/types';

interface HotelCardProps {
  hotel: Hotel;
  price: HotelPrice | null;
  onSelect: () => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, price, onSelect }) => {
  const getImageUrl = (hotel: Hotel) => {
    if (hotel.image_details && hotel.image_details.prefix) {
      return `${hotel.image_details.prefix}1${hotel.image_details.suffix}`;
    }
    return `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop`;
  };

  const renderStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
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

  return (
    <Card className="overflow-hidden hover:shadow-travel transition-all duration-300 group">
      <div className="relative">
        <img
          src={getImageUrl(hotel)}
          alt={hotel.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop`;
          }}
        />
        {hotel.rating > 0 && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            {renderStarRating(hotel.rating)}
          </div>
        )}
        {price && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-lg px-3 py-1 font-semibold">
            ${price.price}
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {hotel.name}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">{hotel.address}</span>
            </div>
          </div>

          {hotel.categories && hotel.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hotel.categories.slice(0, 2).map((category, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex items-center gap-2">
              {hotel.amenities.slice(0, 4).map((amenity, index) => {
                const IconComponent = getAmenityIcon(amenity);
                return IconComponent ? (
                  <div
                    key={index}
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground"
                    title={amenity}
                  >
                    <IconComponent className="w-3 h-3" />
                  </div>
                ) : null;
              })}
              {hotel.amenities.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{hotel.amenities.length - 4} more
                </span>
              )}
            </div>
          )}

          {hotel.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {hotel.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            {price && (
              <div className="text-sm text-muted-foreground">
                Starting from <span className="font-semibold text-foreground">${price.price}</span> / night
              </div>
            )}
            <Button 
              onClick={onSelect}
              variant="outline"
              size="sm"
              className="ml-auto hover:bg-primary hover:text-primary-foreground"
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};