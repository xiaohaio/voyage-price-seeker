import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Calendar, Users, Bed } from 'lucide-react';
import Fuse from 'fuse.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Destination } from '@/types';
import { loadDestinations, formatGuests } from '@/services/api';

interface SearchFormData {
  destination: Destination | null;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  adults: number;
  children: number;
  rooms: number;
}

interface DestinationSearchProps {
  onSearch: (params: {
    destination_id: string;
    checkin: string;
    checkout: string;
    guests: string;
    rooms: number;
    adults: number;
    children: number;
  }) => void;
}

export const DestinationSearch: React.FC<DestinationSearchProps> = ({ onSearch }) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<SearchFormData>({
    destination: null,
    checkIn: undefined,
    checkOut: undefined,
    adults: 2,
    children: 0,
    rooms: 1,
  });

  // Initialize Fuse.js for fast fuzzy search
  const fuse = useMemo(() => {
    if (destinations.length === 0) return null;
    
    return new Fuse(destinations, {
      keys: ['term', 'state'],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 1,
    });
  }, [destinations]);

  // Load destinations on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadDestinations();
        setDestinations(data);
      } catch (error) {
        console.error('Failed to load destinations:', error);
      }
    };
    loadData();
  }, []);

  // Filter destinations based on search term
  const filteredDestinations = useMemo(() => {
    if (!searchTerm.trim() || !fuse) return [];
    
    const results = fuse.search(searchTerm);
    return results.slice(0, 5).map(result => result.item);
  }, [searchTerm, fuse]);

  const handleDestinationSelect = (destination: Destination) => {
    setFormData(prev => ({ ...prev, destination }));
    setSearchTerm(destination.term);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destination || !formData.checkIn || !formData.checkOut) {
      return;
    }

    setLoading(true);
    
    try {
      const guests = formatGuests(formData.adults, formData.children, formData.rooms);
      
      onSearch({
        destination_id: formData.destination.uid,
        checkin: format(formData.checkIn, 'yyyy-MM-dd'),
        checkout: format(formData.checkOut, 'yyyy-MM-dd'),
        guests,
        rooms: formData.rooms,
        adults: formData.adults,
        children: formData.children,
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.destination && formData.checkIn && formData.checkOut && 
                     formData.checkIn < formData.checkOut;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="shadow-travel-xl border-0 card-gradient">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              
              {/* Destination Search */}
              <div className="relative xl:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Where are you going?
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-10 h-12 text-base"
                  />
                  <Search className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
                  
                  {showSuggestions && filteredDestinations.length > 0 && (
                    <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg">
                      <CardContent className="p-0">
                        {filteredDestinations.map((destination) => (
                          <button
                            key={destination.uid}
                            type="button"
                            onClick={() => handleDestinationSelect(destination)}
                            className="w-full px-4 py-3 text-left hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg flex items-center gap-3 transition-colors"
                          >
                            <MapPin className="h-4 w-4 text-primary" />
                            <div>
                              <div className="font-medium">{destination.term}</div>
                              {destination.state && (
                                <div className="text-sm text-muted-foreground">{destination.state}</div>
                              )}
                            </div>
                            <Badge variant="secondary" className="ml-auto">{destination.type}</Badge>
                          </button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Check-in Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Check-in
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
                        !formData.checkIn && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.checkIn ? format(formData.checkIn, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.checkIn}
                      onSelect={(date) => setFormData(prev => ({ ...prev, checkIn: date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Check-out
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
                        !formData.checkOut && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.checkOut ? format(formData.checkOut, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.checkOut}
                      onSelect={(date) => setFormData(prev => ({ ...prev, checkOut: date }))}
                      disabled={(date) => date <= (formData.checkIn || new Date())}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Guests and Rooms Selection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Adults
                </label>
                <Select value={formData.adults.toString()} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, adults: parseInt(value) }))
                }>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Children
                </label>
                <Select value={formData.children.toString()} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, children: parseInt(value) }))
                }>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Bed className="inline w-4 h-4 mr-1" />
                  Rooms
                </label>
                <Select value={formData.rooms.toString()} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, rooms: parseInt(value) }))
                }>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  type="submit" 
                  variant="travel" 
                  size="lg" 
                  className="w-full h-12"
                  disabled={!isFormValid || loading}
                >
                  {loading ? 'Searching...' : 'Search Hotels'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};