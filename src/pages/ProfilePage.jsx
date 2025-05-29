import React, { useContext, useState, useEffect } from 'react';
    import { AppContext } from '@/context/AppContext';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { User, Mail, Phone, MapPin, Edit3, Save, Gift, Star, History, ShieldAlert } from 'lucide-react';
    import { Link } from 'react-router-dom';

    const ProfilePage = () => {
      const { userProfile, updateUserProfile, orders, recentRestaurants, getRestaurantById } = useContext(AppContext);
      const { toast } = useToast();

      const [isEditing, setIsEditing] = useState(false);
      const [formData, setFormData] = useState(userProfile);
      const [punctualityScore, setPunctualityScore] = useState(0);

      useEffect(() => {
        setFormData(userProfile);
      }, [userProfile]);

      useEffect(() => {
        // Calculate Punctuality Score (Simplified)
        // Score based on how many times user was on time for "Ready for Pickup" orders
        let onTimeCount = 0;
        const completedOrders = orders.filter(o => o.status === 'Picked Up' || o.status === 'Ready for Pickup');
        completedOrders.forEach(order => {
          const bookingTime = new Date(order.bookingTime);
          const userArrival = new Date(bookingTime.getTime() + order.userEstimatedArrivalTime * 60000);
          const mealReady = new Date(bookingTime.getTime() + order.estimatedMealReadyTime * 60000);
          // Considered "on time" if arrival is within +/- 5 minutes of meal ready time
          if (Math.abs(userArrival.getTime() - mealReady.getTime()) <= 5 * 60 * 1000) {
            onTimeCount++;
          }
        });
        setPunctualityScore(completedOrders.length > 0 ? Math.round((onTimeCount / completedOrders.length) * 100) : 0);
      }, [orders]);


      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleSaveProfile = () => {
        updateUserProfile(formData);
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved.",
        });
      };
      
      const getOrderStatusColor = (status) => {
        if (status.includes('Cancelled')) return 'text-red-500';
        if (status === 'Ready for Pickup' || status === 'Picked Up') return 'text-green-500';
        if (status === 'Preparing') return 'text-blue-500';
        return 'text-yellow-500';
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <Card className="shadow-xl glassmorphism-card border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 rounded-t-lg flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-bold">Your Profile</CardTitle>
                <CardDescription className="text-primary-foreground/80">Manage your account details and preferences.</CardDescription>
              </div>
              <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "secondary" : "outline"} className="bg-white/20 hover:bg-white/30 text-white border-white/50">
                {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </CardHeader>
            <CardContent className="p-6 grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1 flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32 border-4 border-primary shadow-lg">
                  <AvatarImage src={formData.avatarUrl || `https://avatar.vercel.sh/${formData.name || 'user'}.png`} alt={formData.name} />
                  <AvatarFallback>{formData.name ? formData.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                {isEditing ? (
                  <Input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your Name" className="text-center text-2xl font-semibold" />
                ) : (
                  <h2 className="text-2xl font-semibold text-primary">{formData.name}</h2>
                )}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Punctuality Score</p>
                    <p className="text-2xl font-bold text-accent">{punctualityScore}% <Gift className="inline h-6 w-6 text-yellow-500" /></p>
                    {punctualityScore > 80 && <p className="text-xs text-green-600">Great job! You're often on time!</p>}
                </div>
              </div>
              <div className="md:col-span-2 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="flex items-center text-muted-foreground"><Mail className="mr-2 h-4 w-4 text-primary" />Email</Label>
                    {isEditing ? (
                      <Input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" />
                    ) : (
                      <p className="text-lg font-medium">{formData.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="flex items-center text-muted-foreground"><Phone className="mr-2 h-4 w-4 text-primary" />Phone</Label>
                    {isEditing ? (
                      <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1234567890" />
                    ) : (
                      <p className="text-lg font-medium">{formData.phone}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="flex items-center text-muted-foreground"><MapPin className="mr-2 h-4 w-4 text-primary" />Address</Label>
                  {isEditing ? (
                    <Input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main St, City" />
                  ) : (
                    <p className="text-lg font-medium">{formData.address}</p>
                  )}
                </div>
                {isEditing && (
                  <Button onClick={handleSaveProfile} className="w-full sm:w-auto bg-gradient-primary text-primary-foreground">
                    <Save className="mr-2 h-4 w-4" /> Save All Changes
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="shadow-lg glassmorphism-card border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-primary flex items-center"><History className="mr-2 h-6 w-6" />Order History</CardTitle>
                <CardDescription>Your past and current orders.</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {orders.slice(0, 5).map(order => (
                      <li key={order.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-background/70 dark:bg-slate-800/70">
                        <Link to={`/order-status/${order.id}`} className="block">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{order.restaurantName}</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${getOrderStatusColor(order.status)} bg-opacity-20`}>{order.status}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Order ID: {order.id}</p>
                          <p className="text-xs text-muted-foreground">Date: {new Date(order.bookingTime).toLocaleDateString()}</p>
                        </Link>
                      </li>
                    ))}
                    {orders.length > 5 && <p className="text-center mt-2 text-sm text-primary">View all orders (feature coming soon)</p>}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No orders yet. <Link to="/restaurants" className="text-primary hover:underline">Find a restaurant</Link> to get started!</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg glassmorphism-card border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-primary flex items-center"><Star className="mr-2 h-6 w-6 text-yellow-400" />Smart Recommendations</CardTitle>
                <CardDescription>Based on your recently visited restaurants.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentRestaurants.length > 0 ? (
                  <ul className="space-y-3">
                    {recentRestaurants.slice(0,3).map(rId => {
                      const restaurant = getRestaurantById(rId);
                      if (!restaurant) return null;
                      return (
                        <li key={restaurant.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow bg-background/70 dark:bg-slate-800/70">
                          <Link to={`/book/${restaurant.id}`} className="flex items-center space-x-3">
                            <img  class="w-12 h-12 rounded-md object-cover" alt={restaurant.name} src="https://images.unsplash.com/photo-1590383276111-0392dfd402ac" />
                            <div>
                              <p className="font-semibold">{restaurant.name}</p>
                              <p className="text-xs text-muted-foreground">{restaurant.cuisine} - {restaurant.distance.toFixed(1)}km</p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No recent restaurants to show. Your recommendations will appear here as you dine!</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card className="shadow-lg glassmorphism-card border-red-500/20">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-red-600 dark:text-red-400 flex items-center"><ShieldAlert className="mr-2 h-6 w-6" />Refund Policy & Cancellations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Full Refund:</strong> If cancelled within 2 minutes of booking (before cooking starts).</p>
                <p><strong>Partial Refund:</strong> If meal preparation has begun. Amount depends on progress.</p>
                <p><strong>No Refund:</strong> If food is almost ready or packed for pickup.</p>
                <p className="mt-2">A countdown timer for full refund cancellation is shown on the order status page immediately after booking.</p>
            </CardContent>
          </Card>

        </motion.div>
      );
    };

    export default ProfilePage;