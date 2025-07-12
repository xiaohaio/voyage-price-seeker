import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Award, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DestinationSearch } from '@/components/DestinationSearch';

const Index = () => {
  const navigate = useNavigate();

  const handleSearch = (params: {
    destination_id: string;
    checkin: string;
    checkout: string;
    guests: string;
    rooms: number;
    adults: number;
    children: number;
  }) => {
    const searchParams = new URLSearchParams(params as any);
    navigate(`/hotels?${searchParams.toString()}`);
  };

  const features = [
    {
      icon: Plane,
      title: 'Best Price Guarantee',
      description: 'Find the lowest prices or we\'ll match them',
    },
    {
      icon: Award,
      title: 'Trusted by Millions',
      description: 'Join millions of travelers worldwide',
    },
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Your personal data is always protected',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Get help anytime, anywhere',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TravelBooking
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Hotels</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            <Button variant="outline" size="sm">Sign In</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient text-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Discover Your Perfect Stay
            </h2>
            <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto animate-slide-up">
              Search and compare millions of hotel deals to find the best price for your next adventure
            </p>
          </div>
          
          <div className="animate-slide-up">
            <DestinationSearch onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Why Choose Us</Badge>
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              The Smarter Way to Book Hotels
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience seamless booking with competitive prices and exceptional service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-travel transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Popular Destinations</Badge>
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              Trending Destinations
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore the most popular destinations chosen by travelers like you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=300&fit=crop', hotels: '1,200+' },
              { name: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop', hotels: '2,500+' },
              { name: 'Bangkok, Thailand', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=300&fit=crop', hotels: '1,800+' },
              { name: 'Hong Kong', image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400&h=300&fit=crop', hotels: '900+' },
              { name: 'Seoul, South Korea', image: 'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=400&h=300&fit=crop', hotels: '1,100+' },
              { name: 'Bali, Indonesia', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop', hotels: '1,600+' },
            ].map((destination, index) => (
              <Card key={index} className="overflow-hidden group cursor-pointer hover:shadow-travel transition-all duration-300">
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="text-xl font-semibold">{destination.name}</h4>
                    <p className="text-sm opacity-90">{destination.hotels} hotels</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Plane className="w-6 h-6" />
                <span className="text-xl font-bold">TravelBooking</span>
              </div>
              <p className="text-sm opacity-80">
                Your trusted partner for finding the perfect hotel at the best price.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100 transition-opacity">About Us</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Careers</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Press</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100 transition-opacity">Help Center</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Contact Us</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Safety</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm opacity-80">
            <p>&copy; 2024 TravelBooking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
