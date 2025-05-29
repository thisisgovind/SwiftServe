import React, { useState, useEffect, useContext } from 'react';
    import { Link } from 'react-router-dom';
    import { AppContext } from '@/context/AppContext';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Slider } from "@/components/ui/slider";
    import { motion } from 'framer-motion';
    import { MapPin, Star, Clock, Utensils, Search } from 'lucide-react';
    import { useToast } from "@/components/ui/use-toast";

    const initialRestaurants = [
      { id: '1', name: 'The Green Leaf Eatery', cuisine: 'Vegetarian', rating: 4.5, distance: 2.5, prepTime: 15, imageSlug: 'green-leaf-eatery-exterior' },
      { id: '2', name: 'Spicy Route Grill', cuisine: 'Indian', rating: 4.2, distance: 5.1, prepTime: 20, imageSlug: 'indian-restaurant-facade' },
      { id: '3', name: 'Pasta Paradise', cuisine: 'Italian', rating: 4.8, distance: 0.8, prepTime: 12, imageSlug: 'italian-pasta-place' },
      { id: '4', name: 'Sushi Central', cuisine: 'Japanese', rating: 4.6, distance: 8.3, prepTime: 18, imageSlug: 'sushi-restaurant-modern' },
      { id: '5', name: 'Burger Barn', cuisine: 'American', rating: 4.0, distance: 3.7, prepTime: 10, imageSlug: 'classic-burger-joint' },
      { id: '6', name: 'Taco Town', cuisine: 'Mexican', rating: 4.3, distance: 6.0, prepTime: 15, imageSlug: 'mexican-taco-shop-colorful' },
    ];

    const RestaurantsPage = () => {
      const { addRecentRestaurant } = useContext(AppContext);
      const [restaurants, setRestaurants] = useState(initialRestaurants);
      const [searchTerm, setSearchTerm] = useState('');
      const [distanceFilter, setDistanceFilter] = useState([10]); // Max distance 10km
      const { toast } = useToast();

      useEffect(() => {
        const storedRestaurants = localStorage.getItem('restaurants');
        if (storedRestaurants) {
          setRestaurants(JSON.parse(storedRestaurants));
        } else {
          localStorage.setItem('restaurants', JSON.stringify(initialRestaurants));
        }
      }, []);

      const handleSearch = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
      };

      const handleDistanceChange = (value) => {
        setDistanceFilter(value);
      };
      
      const filteredRestaurants = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm) &&
        restaurant.distance <= distanceFilter[0]
      );

      const getEtaMessage = (distance, prepTime) => {
        const travelTime = distance * 2; // Simplified: 2 mins per km
        const buffer = 5; // 5 mins buffer
        const mealEta = travelTime + prepTime + buffer;

        if (distance <= 1) return { text: "Too quick for prep", suitable: false, eta: mealEta };
        if (distance > 1 && distance <= 3) return { text: "Ideal for quick meals", suitable: true, eta: mealEta };
        if (distance > 3 && distance <= 5) return { text: "Good for moderate prep", suitable: true, eta: mealEta };
        if (distance > 5 && distance <= 7) return { text: "Good for large orders", suitable: true, eta: mealEta };
        return { text: "Risk of delay, consider carefully", suitable: false, eta: mealEta };
      };

      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <section className="bg-gradient-to-r from-primary to-accent p-8 rounded-lg shadow-xl text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Find Your Next Meal</h1>
            <p className="text-lg text-primary-foreground">Discover restaurants near you and book with SwiftServe for a perfectly timed meal.</p>
          </section>

          <div className="grid md:grid-cols-3 gap-6 items-end p-6 bg-card rounded-lg shadow">
            <div className="md:col-span-2">
              <Label htmlFor="search-restaurant" className="text-lg font-semibold mb-2 block">Search Restaurants</Label>
              <div className="relative">
                <Input
                  id="search-restaurant"
                  type="text"
                  placeholder="Search by name or cuisine..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 text-base"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <Label htmlFor="distance-filter" className="text-lg font-semibold mb-2 block">Max Distance: {distanceFilter[0]} km</Label>
              <Slider
                id="distance-filter"
                min={0}
                max={10}
                step={0.5}
                value={distanceFilter}
                onValueChange={handleDistanceChange}
              />
            </div>
          </div>

          {filteredRestaurants.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants.map((restaurant, index) => {
                const etaInfo = getEtaMessage(restaurant.distance, restaurant.prepTime);
                return (
                  <motion.div
                    key={restaurant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 glassmorphism-card border-primary/20">
                      <CardHeader className="p-0">
                        <div className="relative h-48 w-full">
                          <img  class="absolute inset-0 w-full h-full object-cover" alt={`Exterior of ${restaurant.name}`} src="https://images.unsplash.com/photo-1590383276111-0392dfd402ac" />
                          <div className="absolute inset-0 bg-black/30 flex items-end p-4">
                            <CardTitle className="text-2xl font-bold text-white">{restaurant.name}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow p-6 space-y-3">
                        <CardDescription className="text-base text-foreground/80">{restaurant.cuisine}</CardDescription>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Star className="h-5 w-5 text-yellow-400" /> <span>{restaurant.rating}</span>
                          <MapPin className="h-5 w-5 text-red-500" /> <span>{restaurant.distance.toFixed(1)} km</span>
                          <Clock className="h-5 w-5 text-blue-500" /> <span>Prep: {restaurant.prepTime} min</span>
                        </div>
                        <p className={`text-sm font-medium ${etaInfo.suitable ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          ETA Status: {etaInfo.text} (Meal ready in ~{etaInfo.eta} mins)
                        </p>
                      </CardContent>
                      <CardFooter className="p-6 bg-transparent border-t border-primary/10">
                        <Button asChild size="lg" className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90" onClick={() => addRecentRestaurant(restaurant)}>
                          <Link to={`/book/${restaurant.id}`}>
                            Book Now <Utensils className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">No restaurants match your criteria. Try adjusting your search or distance.</p>
            </motion.div>
          )}
        </motion.div>
      );
    };

    export default RestaurantsPage;