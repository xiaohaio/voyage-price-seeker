import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Mail, Phone, Home, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Confirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  // Mock booking data - in real app this would come from API
  const booking = {
    id: bookingId || 'BK1234567890',
    hotelName: 'Marina Bay Sands',
    hotelAddress: '10 Bayfront Ave, Singapore 018956',
    checkIn: '2024-12-15',
    checkOut: '2024-12-18',
    nights: 3,
    guests: 2,
    rooms: 1,
    roomType: 'Deluxe Room with Marina Bay View',
    totalAmount: 600,
    guestName: 'John Doe',
    email: 'john@example.com',
    phone: '+65 9123 4567',
    status: 'Confirmed',
    bookingDate: new Date().toISOString(),
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    alert('Receipt download would be triggered here');
  };

  const handleEmailReceipt = () => {
    // In a real app, this would send the receipt via email
    alert('Receipt would be sent to your email');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TravelBooking
              </span>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground text-lg">
              Your hotel reservation has been successfully completed
            </p>
            <Badge variant="success" className="mt-4">
              Confirmation Number: {booking.id}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hotel Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Hotel Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{booking.hotelName}</h3>
                    <p className="text-muted-foreground">{booking.hotelAddress}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Check-in:</span>
                      <div className="text-lg">{booking.checkIn}</div>
                      <div className="text-muted-foreground">3:00 PM</div>
                    </div>
                    <div>
                      <span className="font-medium">Check-out:</span>
                      <div className="text-lg">{booking.checkOut}</div>
                      <div className="text-muted-foreground">11:00 AM</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Duration:</span>
                      <div>{booking.nights} nights</div>
                    </div>
                    <div>
                      <span className="font-medium">Guests:</span>
                      <div>{booking.guests} guests</div>
                    </div>
                    <div>
                      <span className="font-medium">Rooms:</span>
                      <div>{booking.rooms} room</div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Room Type:</span>
                    <div className="mt-1">{booking.roomType}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Guest Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Guest Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Primary Guest:</span>
                      <div>{booking.guestName}</div>
                    </div>
                    <div>
                      <span className="font-medium">Booking Status:</span>
                      <Badge variant="success">{booking.status}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{booking.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{booking.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Important Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Important Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Cancellation Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      Free cancellation until 24 hours before check-in. After that, cancellations may incur a charge of one night's stay.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Check-in Requirements</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Valid government-issued photo ID required</li>
                      <li>• Credit card for incidental charges</li>
                      <li>• Booking confirmation (this page)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary & Actions */}
            <div className="space-y-6">
              {/* Price Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Room rate ({booking.nights} nights)</span>
                    <span>${booking.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & fees</span>
                    <span>Included</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Paid</span>
                    <span className="text-primary">${booking.totalAmount}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Receipt & Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleDownloadReceipt}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleEmailReceipt}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Receipt
                  </Button>
                  
                  <Separator />
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Need help with your booking?</p>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Save your confirmation</div>
                      <div className="text-muted-foreground">Keep this page or download the receipt</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Prepare for check-in</div>
                      <div className="text-muted-foreground">Bring valid ID and this confirmation</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Enjoy your stay!</div>
                      <div className="text-muted-foreground">Have a wonderful trip</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="mt-8 text-center space-y-4">
            <h3 className="text-lg font-semibold">Plan Your Next Trip</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="travel" 
                onClick={() => navigate('/')}
              >
                Book Another Hotel
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
              >
                Browse Destinations
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Confirmation;