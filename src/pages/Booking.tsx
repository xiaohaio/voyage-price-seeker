import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, User, Shield, CheckCircle, Plane } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getHotelDetails, createBooking } from '@/services/api';
import type { Hotel, BookingData } from '@/types';

const bookingSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  specialRequests: z.string().optional(),
  cardNumber: z.string().min(16, 'Please enter a valid card number').max(19),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Please enter a valid expiry date (MM/YY)'),
  cvv: z.string().min(3, 'CVV must be at least 3 digits').max(4),
  billingStreet: z.string().min(5, 'Street address is required'),
  billingCity: z.string().min(2, 'City is required'),
  billingState: z.string().min(2, 'State is required'),
  billingZipCode: z.string().min(5, 'ZIP code is required'),
  billingCountry: z.string().min(2, 'Country is required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Extract booking parameters
  const bookingParams = {
    hotelId: searchParams.get('hotelId') || '',
    roomKey: searchParams.get('roomKey') || '',
    checkin: searchParams.get('checkin') || '',
    checkout: searchParams.get('checkout') || '',
    guests: searchParams.get('guests') || '',
    rooms: parseInt(searchParams.get('rooms') || '1'),
    adults: parseInt(searchParams.get('adults') || '2'),
    children: parseInt(searchParams.get('children') || '0'),
  };

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      billingStreet: '',
      billingCity: '',
      billingState: '',
      billingZipCode: '',
      billingCountry: 'Singapore',
    },
  });

  useEffect(() => {
    const loadHotelData = async () => {
      if (!bookingParams.hotelId) {
        navigate('/');
        return;
      }

      try {
        const hotelData = await getHotelDetails(bookingParams.hotelId);
        setHotel(hotelData);
      } catch (error) {
        console.error('Failed to load hotel data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load hotel information',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadHotelData();
  }, [bookingParams.hotelId]);

  const calculateNights = () => {
    const checkIn = new Date(bookingParams.checkin);
    const checkOut = new Date(bookingParams.checkout);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const onSubmit = async (data: BookingFormData) => {
    setSubmitting(true);
    
    try {
      const bookingData: BookingData = {
        hotelId: bookingParams.hotelId,
        roomKey: bookingParams.roomKey,
        checkIn: bookingParams.checkin,
        checkOut: bookingParams.checkout,
        guests: bookingParams.guests,
        guestInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          specialRequests: data.specialRequests,
        },
        paymentInfo: {
          cardNumber: data.cardNumber,
          expiryDate: data.expiryDate,
          cvv: data.cvv,
          billingAddress: {
            street: data.billingStreet,
            city: data.billingCity,
            state: data.billingState,
            zipCode: data.billingZipCode,
            country: data.billingCountry,
          },
        },
      };

      const result = await createBooking(bookingData);
      
      if (result.success) {
        toast({
          title: 'Booking Confirmed!',
          description: `Your booking reference is ${result.booking.id}`,
        });
        
        // Navigate to confirmation page
        navigate(`/confirmation/${result.booking.id}`);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      toast({
        title: 'Booking Failed',
        description: 'Please check your information and try again',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
          <Button onClick={() => navigate('/')} variant="travel">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const nights = calculateNights();
  const basePrice = 200; // Mock price - in real app this would come from room data
  const totalPrice = basePrice * nights;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center gap-2">
                <Plane className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TravelBooking
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Guest Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+65 9123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requests (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requests or notes for the hotel..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Payment Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Information
                      </h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="1234 5678 9012 3456"
                                  {...field}
                                  onChange={(e) => {
                                    const formatted = formatCardNumber(e.target.value);
                                    field.onChange(formatted);
                                  }}
                                  maxLength={19}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="MM/YY"
                                    {...field}
                                    onChange={(e) => {
                                      let value = e.target.value.replace(/\D/g, '');
                                      if (value.length >= 2) {
                                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                      }
                                      field.onChange(value);
                                    }}
                                    maxLength={5}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="123"
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '');
                                      field.onChange(value);
                                    }}
                                    maxLength={4}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Billing Address */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="billingStreet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address *</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main Street" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="billingCity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Singapore" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="billingState"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State/Province *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Singapore" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="billingZipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP/Postal Code *</FormLabel>
                                <FormControl>
                                  <Input placeholder="123456" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="billingCountry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Singapore" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      variant="travel" 
                      size="lg" 
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Booking
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">{hotel.name}</h4>
                  <p className="text-muted-foreground text-sm">{hotel.address}</p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Check-in</span>
                    <span className="font-medium">{bookingParams.checkin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out</span>
                    <span className="font-medium">{bookingParams.checkout}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nights</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests</span>
                    <span className="font-medium">
                      {bookingParams.adults} adults
                      {bookingParams.children > 0 && `, ${bookingParams.children} children`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rooms</span>
                    <span className="font-medium">{bookingParams.rooms}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Room rate (per night)</span>
                    <span>${basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total ({nights} nights)</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & fees</span>
                    <span>Included</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-primary">${totalPrice}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <Badge variant="success" className="w-full justify-center">
                  Free Cancellation
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Booking;