import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, MapPin, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { HotelCard } from './HotelCard';
import { FilterPanel } from './FilterPanel';
import type { Hotel, HotelPrice, FilterOptions, SortOption } from '@/types';

interface HotelResultsProps {
  hotels: Hotel[];
  prices: HotelPrice[];
  loading: boolean;
  searchParams: {
    destination_id: string;
    checkin: string;
    checkout: string;
    guests: string;
    rooms: number;
    adults: number;
    children: number;
  };
  onHotelSelect: (hotelId: string) => void;
}

const sortOptions: SortOption[] = [
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating-high', label: 'Star Rating: High to Low' },
  { value: 'rating-low', label: 'Star Rating: Low to High' },
  { value: 'name', label: 'Name: A to Z' },
];

export const HotelResults: React.FC<HotelResultsProps> = ({
  hotels,
  prices,
  loading,
  searchParams,
  onHotelSelect,
}) => {
  const [sortBy, setSortBy] = useState<string>('price-low');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const itemsPerPage = 12;

  const [filters, setFilters] = useState<FilterOptions>({
    starRating: [],
    guestRating: [],
    priceRange: [0, 1000],
  });

  // Calculate price range from available prices
  const priceRange = useMemo(() => {
    if (!prices || !Array.isArray(prices) || prices.length === 0) return [0, 1000] as [number, number];
    
    const allPrices = prices.map(p => p.price);
    const min = Math.floor(Math.min(...allPrices) / 10) * 10;
    const max = Math.ceil(Math.max(...allPrices) / 10) * 10;
    
    return [min, max] as [number, number];
  }, [prices]);

  // Update price range filter when price range changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: priceRange,
    }));
  }, [priceRange]);

  // Combine hotels with their prices
  const hotelsWithPrices = useMemo(() => {
    return hotels.map(hotel => {
      const price = prices && Array.isArray(prices) ? prices.find(p => p.id === hotel.id) : null;
      return { hotel, price: price || null };
    });
  }, [hotels, prices]);

  // Apply filters
  const filteredHotels = useMemo(() => {
    return hotelsWithPrices.filter(({ hotel, price }) => {
      // Star rating filter
      if (filters.starRating.length > 0 && !filters.starRating.includes(hotel.rating)) {
        return false;
      }

      // Price range filter
      if (price && (price.price < filters.priceRange[0] || price.price > filters.priceRange[1])) {
        return false;
      }

      // Guest rating filter (placeholder logic - in real app this would come from reviews)
      if (filters.guestRating.length > 0) {
        // For demo purposes, assign random guest ratings based on star rating
        const estimatedGuestRating = Math.min(hotel.rating * 2, 10);
        const hasMatchingGuestRating = filters.guestRating.some(rating => estimatedGuestRating >= rating);
        if (!hasMatchingGuestRating) {
          return false;
        }
      }

      return true;
    });
  }, [hotelsWithPrices, filters]);

  // Apply sorting
  const sortedHotels = useMemo(() => {
    const sorted = [...filteredHotels];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => {
          if (!a.price && !b.price) return 0;
          if (!a.price) return 1;
          if (!b.price) return -1;
          return a.price.price - b.price.price;
        });
      
      case 'price-high':
        return sorted.sort((a, b) => {
          if (!a.price && !b.price) return 0;
          if (!a.price) return 1;
          if (!b.price) return -1;
          return b.price.price - a.price.price;
        });
      
      case 'rating-high':
        return sorted.sort((a, b) => b.hotel.rating - a.hotel.rating);
      
      case 'rating-low':
        return sorted.sort((a, b) => a.hotel.rating - b.hotel.rating);
      
      case 'name':
        return sorted.sort((a, b) => a.hotel.name.localeCompare(b.hotel.name));
      
      default:
        return sorted;
    }
  }, [filteredHotels, sortBy]);

  // Pagination
  const paginatedHotels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedHotels.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedHotels, currentPage]);

  const totalPages = Math.ceil(sortedHotels.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Searching for the best hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {sortedHotels.length} Hotels Found
          </h2>
          <p className="text-muted-foreground">
            {searchParams.checkin} - {searchParams.checkout} • {searchParams.adults} adults
            {searchParams.children > 0 && `, ${searchParams.children} children`} • {searchParams.rooms} room{searchParams.rooms > 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            priceRange={priceRange}
          />
        </div>

        {/* Hotel Grid */}
        <div className="lg:col-span-3">
          {paginatedHotels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hotels match your current filters.</p>
              <Button
                variant="outline"
                onClick={() => setFilters({
                  starRating: [],
                  guestRating: [],
                  priceRange: priceRange,
                })}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedHotels.map(({ hotel, price }) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    price={price}
                    onSelect={() => onHotelSelect(hotel.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant={totalPages === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};