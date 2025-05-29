import React, { useContext, useEffect, useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { MapPin, Clock, Utensils, ShieldCheck, Gift, BarChart, LockKeyhole, Palette, Award, Search, ArrowRight, ShoppingCart, Activity } from 'lucide-react';
    import { Link } from 'react-router-dom';
    import { AppContext } from '@/context/AppContext';
    import { Progress } from '@/components/ui/progress';

    const FeatureCard = ({ icon, title, description, delay = 0 }) => {
      const IconComponent = icon;
      return (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay * 0.1 }}
        >
          <Card className="h-full hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-2 border-primary/30">
            <CardHeader className="items-center text-center">
              <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-full text-primary-foreground mb-3">
                <IconComponent size={32} />
              </div>
              <CardTitle className="text-xl font-semibold text-primary">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-700 dark:text-gray-300">{description}</CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      );
    };
    
    const BenefitItem = ({ title, forCustomer, forRestaurant, delay = 0 }) => (
      <motion.div 
        className="bg-secondary/50 dark:bg-secondary/20 p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay * 0.15 }}
      >
        <h3 className="text-xl font-semibold text-primary mb-3">{title}</h3>
        <div className="space-y-2">
          <p><strong className="text-green-600 dark:text-green-400">For Customer:</strong> {forCustomer}</p>
          <p><strong className="text-blue-600 dark:text-blue-400">For Restaurant:</strong> {forRestaurant}</p>
        </div>
      </motion.div>
    );

    const LiveOrderStatusWidget = ({ order }) => {
      if (!order) return null;

      const getProgressValue = () => {
        if (order.status === 'Pending Confirmation') return 25;
        if (order.status === 'Preparing') return 60;
        if (order.status === 'Ready for Pickup') return 90;
        return 10; 
      };
    
      return (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Activity className="mr-3 h-7 w-7 animate-pulse" />
                  Your Live Order
                </CardTitle>
                <span className="text-xs px-2 py-1 bg-white/20 rounded-full">{order.status}</span>
              </div>
              <CardDescription className="text-blue-100">
                Track your meal from {order.restaurantName}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm"><strong>Meal:</strong> {order.mealDetails.length > 40 ? order.mealDetails.substring(0, 37) + "..." : order.mealDetails}</p>
              <Progress value={getProgressValue()} className="h-2 [&>div]:bg-yellow-400" />
               <p className="text-xs text-blue-200">Est. Arrival: {new Date(new Date(order.bookingTime).getTime() + order.userEstimatedArrivalTime * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} / Est. Ready: {new Date(new Date(order.bookingTime).getTime() + order.estimatedMealReadyTime * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full bg-white/90 hover:bg-white text-indigo-600 font-semibold border-none">
                <Link to={`/order-status/${order.id}`}>
                  View Full Status <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.section>
      );
    };


    const HomePage = () => {
      const { orders } = useContext(AppContext);
      const [activeOrder, setActiveOrder] = useState(null);

      useEffect(() => {
        const findActiveOrder = orders.find(
          (order) => order.status !== 'Picked Up' && 
                       !order.status.startsWith('Cancelled')
        );
        setActiveOrder(findActiveOrder || null);
      }, [orders]);

      const features = [
        { icon: MapPin, title: "Booking Radius (0-10 km)", description: "Filter restaurants by 0-10 km range to plan visits efficiently." },
        { icon: Clock, title: "Smart Meal ETA", description: "Calculates best match between your arrival and meal readiness." },
        { icon: Utensils, title: "Real-time Cooking Trigger", description: "Cooking starts exactly in sync with your ETA for maximum freshness." },
        { icon: ShieldCheck, title: "Smart Refund System", description: "Fair refund policy based on cooking progress with on-screen timer." },
        { icon: BarChart, title: "Live Meal Status Tracker", description: "Track your meal's progress in real-time from kitchen to table." },
        { icon: LockKeyhole, title: "Meal Locker System", description: "Secure meal pickup for late arrivals, ensuring food safety and convenience." },
        { icon: Palette, title: "Color-coded Status", description: "Instantly know your timing: Red (Early), Green (On-time)." },
        { icon: Search, title: "Smart Recommender", description: "Personalized suggestions based on your order history and preferences." },
        { icon: Award, title: "Punctuality Rewards", description: "Gamified rewards for being on time, enhancing user engagement." },
      ];

      const onScreenExample = {
        restaurant: "Shree Veg Point (4.3*)",
        distance: "3.5 km",
        eta: "9 mins",
        prepTime: "10 mins",
        buffer: "2 mins",
        estimatedReadyTime: "11 mins",
        status: "Perfect Timing - Meal will be fresh on arrival!",
      };
      
      const benefits = [
        { title: "Time Clarity", forCustomer: "Knows exact wait time, less frustration.", forRestaurant: "Efficient scheduling, avoids early/delayed prep." },
        { title: "Reduced Uncertainty", forCustomer: "Minimizes anxiety about meal readiness.", forRestaurant: "Better kitchen workflow and resource management." },
        { title: "Enhanced Trust", forCustomer: "Feels smart & reliable service.", forRestaurant: "Reduces cancellations and builds customer loyalty." },
      ];

      return (
        <div className="space-y-16">
          {activeOrder && <LiveOrderStatusWidget order={activeOrder} />}

          <motion.section 
            className="text-center py-16 md:py-24 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="container mx-auto px-4">
              <motion.h1 
                className="text-5xl md:text-6xl font-extrabold text-white mb-6"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                SwiftServe
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Smart Dine-in Planner: Arrive Fresh, Eat Fresh - Your food will be ready just as you arrive!
              </motion.p>
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-green-800 font-bold text-lg px-10 py-7 rounded-lg shadow-lg transform hover:scale-105 transition-transform asChild">
                  <Link to="/restaurants">
                    Plan Your Meal Now
                    <ShoppingCart className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <div className="mt-12 flex justify-center">
                <img  class="w-full max-w-md rounded-lg shadow-xl" alt="Illustration of a happy person receiving a freshly prepared meal on time" src="https://images.unsplash.com/photo-1644949496729-335fd04b1869" />
              </div>
            </div>
          </motion.section>

          <section>
            <h2 className="section-title text-center mb-12">How SwiftServe Works</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} delay={index} />
              ))}
            </div>
          </section>
          
          <motion.section
            className="py-12 bg-gradient-to-r from-gray-700 via-gray-800 to-black rounded-xl shadow-xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300 mb-8">On-Screen Example</h2>
              <Card className="max-w-md mx-auto bg-slate-800/70 backdrop-blur-sm border-green-500/50 shadow-green-500/30 shadow-lg text-left">
                <CardHeader>
                  <CardTitle className="text-2xl text-green-400">{onScreenExample.restaurant}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-200">
                  <p><strong>Distance:</strong> {onScreenExample.distance}</p>
                  <p><strong>Your ETA:</strong> <span className="text-yellow-400 font-semibold">{onScreenExample.eta}</span></p>
                  <p><strong>Meal Prep Time:</strong> {onScreenExample.prepTime}</p>
                  <p><strong>Buffer Time:</strong> {onScreenExample.buffer}</p>
                  <p><strong>Estimated Ready Time:</strong> <span className="text-yellow-400 font-semibold">{onScreenExample.estimatedReadyTime}</span></p>
                </CardContent>
                <CardFooter className="bg-green-600/30 p-4 rounded-b-md">
                  <p className="text-lg font-semibold text-green-300 w-full text-center">{onScreenExample.status}</p>
                </CardFooter>
              </Card>
            </div>
          </motion.section>

          <section>
            <h2 className="section-title text-center mb-12">Benefits For All</h2>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <BenefitItem 
                  key={benefit.title} 
                  title={benefit.title} 
                  forCustomer={benefit.forCustomer} 
                  forRestaurant={benefit.forRestaurant}
                  delay={index}
                />
              ))}
            </div>
          </section>
          
          <motion.section 
            className="text-center py-12 bg-primary/10 dark:bg-primary/5 rounded-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-primary mb-4">Ready to Dine Smarter?</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-xl mx-auto">
                Join SwiftServe today and transform your dining experience. No more unnecessary waiting, just perfectly timed meals.
              </p>
              <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity asChild">
                <Link to="/restaurants">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.section>
        </div>
      );
    };

    export default HomePage;