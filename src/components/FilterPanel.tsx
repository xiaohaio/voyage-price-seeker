import React from 'react';
import { Star, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { FilterOptions } from '@/types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  priceRange: [number, number];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  priceRange,
}) => {
  const handleStarRatingChange = (rating: number, checked: boolean) => {
    const newStarRatings = checked
      ? [...filters.starRating, rating]
      : filters.starRating.filter(r => r !== rating);
    
    onFiltersChange({
      ...filters,
      starRating: newStarRatings,
    });
  };

  const handleGuestRatingChange = (rating: number, checked: boolean) => {
    const newGuestRatings = checked
      ? [...filters.guestRating, rating]
      : filters.guestRating.filter(r => r !== rating);
    
    onFiltersChange({
      ...filters,
      guestRating: newGuestRatings,
    });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [value[0], value[1]],
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      starRating: [],
      guestRating: [],
      priceRange: priceRange,
    });
  };

  const hasActiveFilters = 
    filters.starRating.length > 0 || 
    filters.guestRating.length > 0 || 
    filters.priceRange[0] !== priceRange[0] || 
    filters.priceRange[1] !== priceRange[1];

  const renderStars = (count: number) => {
    return Array.from({ length: count }, (_, index) => (
      <Star key={index} className="w-4 h-4 text-warning fill-warning" />
    ));
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Price Range (per night)
          </Label>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={priceRange[1]}
              min={priceRange[0]}
              step={10}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Star Rating */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Hotel Star Rating
          </Label>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-3">
                <Checkbox
                  id={`star-${rating}`}
                  checked={filters.starRating.includes(rating)}
                  onCheckedChange={(checked) => 
                    handleStarRatingChange(rating, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`star-${rating}`}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  {renderStars(rating)}
                  <span className="text-sm ml-1">{rating} Star{rating !== 1 ? 's' : ''}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Guest Rating */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Guest Rating
          </Label>
          <div className="space-y-3">
            {[
              { rating: 9, label: 'Excellent (9.0+)' },
              { rating: 8, label: 'Very Good (8.0+)' },
              { rating: 7, label: 'Good (7.0+)' },
              { rating: 6, label: 'Pleasant (6.0+)' },
            ].map(({ rating, label }) => (
              <div key={rating} className="flex items-center space-x-3">
                <Checkbox
                  id={`guest-${rating}`}
                  checked={filters.guestRating.includes(rating)}
                  onCheckedChange={(checked) => 
                    handleGuestRatingChange(rating, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`guest-${rating}`}
                  className="text-sm cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};