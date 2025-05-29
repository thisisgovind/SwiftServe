import React, { useState, useEffect, useContext } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { AppContext } from '@/context/AppContext';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Clock, MapPin, Utensils, CalendarDays, Users, AlertTriangle, Info } from 'lucide-react';

    const BookingPage = () => {
      const { restaurantId } = useParams();
      const navigate = useNavigate();
      const { addOrder, getRestaurantById } = useContext(AppContext);
      const { toast } = useToast();

      const [restaurant, setRestaurant] = useState(null);
      const [name, setName] = useState('');
      const [partySize, setPartySize] = useState(1);
      const [estimatedArrivalTime, setEstimatedArrivalTime] = useState(''); // User's ETA in minutes
      const [mealDetails, setMealDetails] = useState('');
      
      const [calculatedEta, setCalculatedEta] = useState(null);
      const [bookingStatusMessage, setBookingStatusMessage] = useState('');
      const [canBook, setCanBook] = useState(false);

      useEffect(() => {
        const fetchedRestaurant = getRestaurantById(restaurantId);
        if (fetchedRestaurant) {
          setRestaurant(fetchedRestaurant);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Restaurant not found.",
          });
          navigate('/restaurants');
        }
      }, [restaurantId, getRestaurantById, navigate, toast]);

      useEffect(() => {
        if (restaurant && estimatedArrivalTime) {
          const userTravelTime = parseInt(estimatedArrivalTime, 10);
          if (isNaN(userTravelTime) || userTravelTime <= 0) {
            setBookingStatusMessage("Please enter a valid arrival time.");
            setCanBook(false);
            setCalculatedEta(null);
            return;
          }

          const prepTime = restaurant.prepTime;
          const buffer = 5; // 5 mins buffer for traffic/load
          
          const mealReadyTime = prepTime + buffer; // Time restaurant needs
          setCalculatedEta({ userTravelTime, mealReadyTime });

          // Smart Meal ETA Calculation Logic
          if (userTravelTime < prepTime - buffer/2) { // Arriving too early
            setBookingStatusMessage(`You might arrive too early. Meal needs ~${mealReadyTime} mins. Consider arriving in ${mealReadyTime - userTravelTime} more mins.`);
            setCanBook(false);
          } else if (userTravelTime > mealReadyTime + 15) { // Arriving too late
            setBookingStatusMessage(`You might arrive too late. Meal will be ready in ~${mealReadyTime} mins. Food might not be fresh.`);
            setCanBook(true); // Can still book, but with warning
          } else { // Good timing
            setBookingStatusMessage(`Perfect timing! Your meal will be fresh. Estimated ready around your arrival.`);
            setCanBook(true);
          }
        } else {
          setBookingStatusMessage('');
          setCanBook(false);
          setCalculatedEta(null);
        }
      }, [restaurant, estimatedArrivalTime]);


      const handleSubmitBooking = (e) => {
        e.preventDefault();
        if (!canBook && !(bookingStatusMessage.includes("too late"))) { // Allow booking if "too late" but not "too early"
          toast({
            variant: "destructive",
            title: "Booking Issue",
            description: "Please adjust your arrival time for optimal freshness or acknowledge the timing warning.",
          });
          return;
        }
        if (!name || !partySize || !estimatedArrivalTime || !mealDetails) {
          toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill in all fields.",
          });
          return;
        }

        const orderId = `SW-${Date.now()}`;
        const newOrder = {
          id: orderId,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          userName: name,
          partySize,
          userEstimatedArrivalTime: parseInt(estimatedArrivalTime, 10),
          mealDetails,
          prepTime: restaurant.prepTime,
          bookingTime: new Date().toISOString(),
          status: 'Pending Confirmation', // Initial status
          cookingTriggered: false,
          estimatedMealReadyTime: calculatedEta ? calculatedEta.mealReadyTime : restaurant.prepTime + 5,
        };

        addOrder(newOrder);
        toast({
          title: "Booking Submitted!",
          description: `Your booking for ${restaurant.name} is being processed. Order ID: ${orderId}`,
        });
        navigate(`/order-status/${orderId}`);
      };

      if (!restaurant) {
        return <div className="text-center py-10"><Clock className="mx-auto h-12 w-12 text-primary animate-spin" /> <p className="mt-4 text-lg">Loading restaurant details...</p></div>;
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-2xl mx-auto shadow-2xl glassmorphism-card border-primary/30">
            <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 rounded-t-lg">
              <CardTitle className="text-3xl font-bold">Book at {restaurant.name}</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-sm">
                <MapPin className="inline h-4 w-4 mr-1" /> {restaurant.distance.toFixed(1)} km away &nbsp;&nbsp;
                <Utensils className="inline h-4 w-4 mr-1" /> Prep time: {restaurant.prepTime} min
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleSubmitBooking} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-lg font-medium">Your Name</Label>
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Jane Doe" required className="mt-1 text-base" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="partySize" className="text-lg font-medium">Party Size</Label>
                    <Input id="partySize" type="number" value={partySize} onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value)))} min="1" required className="mt-1 text-base" />
                  </div>
                  <div>
                    <Label htmlFor="estimatedArrivalTime" className="text-lg font-medium">Your ETA (minutes)</Label>
                    <Input id="estimatedArrivalTime" type="number" value={estimatedArrivalTime} onChange={(e) => setEstimatedArrivalTime(e.target.value)} placeholder="e.g., 20" min="1" required className="mt-1 text-base" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="mealDetails" className="text-lg font-medium">Meal Details / Special Requests</Label>
                  <Input id="mealDetails" type="text" value={mealDetails} onChange={(e) => setMealDetails(e.target.value)} placeholder="e.g., 2x Veggie Burger, 1x Fries, no onions" required className="mt-1 text-base h-20" />
                </div>

                {bookingStatusMessage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-4 rounded-md text-sm flex items-start space-x-2 ${
                      bookingStatusMessage.includes("Perfect") ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 
                      bookingStatusMessage.includes("late") ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                      'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {bookingStatusMessage.includes("Perfect") ? <Info size={20} /> : <AlertTriangle size={20} />}
                    <p>{bookingStatusMessage}</p>
                  </motion.div>
                )}
                
                <Button type="submit" size="lg" className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 text-lg py-3" disabled={!estimatedArrivalTime || (!canBook && !bookingStatusMessage.includes("late"))}>
                  <CalendarDays className="mr-2 h-5 w-5" /> Submit Booking
                </Button>
              </form>
            </CardContent>
            <CardFooter className="p-4 bg-secondary/30 dark:bg-secondary/10 rounded-b-lg text-center">
                <p className="text-xs text-muted-foreground">
                    Your booking helps us prepare your meal perfectly on time.
                    Review cancellation policy in your profile.
                </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default BookingPage;