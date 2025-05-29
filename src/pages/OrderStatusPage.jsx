import React, { useState, useEffect, useContext } from 'react';
    import { useParams, Link, useNavigate } from 'react-router-dom';
    import { AppContext } from '@/context/AppContext';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Progress } from '@/components/ui/progress';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Utensils, Clock, CheckCircle, XCircle, Hourglass, ShoppingBag, Lock, AlertTriangle, Info } from 'lucide-react';

    const OrderStatusPage = () => {
      const { orderId } = useParams();
      const navigate = useNavigate();
      const { getOrderById, updateOrderStatus, cancelOrder } = useContext(AppContext);
      const { toast } = useToast();

      const [order, setOrder] = useState(null);
      const [currentTime, setCurrentTime] = useState(new Date());
      const [cancellationWindowActive, setCancellationWindowActive] = useState(false);
      const [timeLeftForCancellation, setTimeLeftForCancellation] = useState(0);

      useEffect(() => {
        const fetchedOrder = getOrderById(orderId);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
        } else {
          toast({ variant: "destructive", title: "Error", description: "Order not found." });
          navigate('/');
        }
      }, [orderId, getOrderById, navigate, toast]);

      useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
      }, []);

      useEffect(() => {
        if (order) {
          const bookingTime = new Date(order.bookingTime);
          const cancellationDeadline = new Date(bookingTime.getTime() + 2 * 60 * 1000); // 2 minutes
          const remaining = Math.max(0, Math.floor((cancellationDeadline - currentTime) / 1000));
          setTimeLeftForCancellation(remaining);
          setCancellationWindowActive(remaining > 0 && order.status === 'Pending Confirmation');

          // Simulate Real-time Cooking Trigger & Status Updates
          if (order.status === 'Pending Confirmation' && !order.cookingTriggered) {
            const timeToArrival = order.userEstimatedArrivalTime * 60 * 1000; // in ms
            const timeSinceBooking = currentTime - bookingTime;
            // Trigger cooking if user's ETA is close to meal prep time + buffer
            // This is a simplified simulation. A real app would use backend logic.
            if (timeSinceBooking > (timeToArrival - (order.prepTime + 5) * 60 * 1000) && timeToArrival > (order.prepTime + 5) * 60 * 1000) {
               if (!order.cookingTriggered && order.status === 'Pending Confirmation') {
                 updateOrderStatus(order.id, 'Preparing', true);
                 setOrder(prev => ({...prev, status: 'Preparing', cookingTriggered: true}));
                 toast({ title: "Order Update", description: "Kitchen has started preparing your meal!" });
               }
            }
          }
          // Simulate meal ready
          if (order.status === 'Preparing' && order.cookingTriggered) {
             const prepEndTime = new Date(bookingTime.getTime() + (order.userEstimatedArrivalTime) * 60 * 1000); // Approx when meal should be ready based on user ETA
             if (currentTime >= prepEndTime) {
                updateOrderStatus(order.id, 'Ready for Pickup');
                setOrder(prev => ({...prev, status: 'Ready for Pickup'}));
                toast({ title: "Meal Ready!", description: "Your meal is ready for pickup." });
             }
          }
        }
      }, [order, currentTime, updateOrderStatus, toast]);

      const handleCancelOrder = () => {
        if (cancellationWindowActive) {
          cancelOrder(order.id, "full");
          setOrder(prev => ({...prev, status: 'Cancelled (Full Refund)'}));
          toast({ title: "Order Cancelled", description: "Your order has been cancelled with a full refund." });
        } else if (order.status === 'Preparing') {
           // Partial refund logic (simplified)
           cancelOrder(order.id, "partial");
           setOrder(prev => ({...prev, status: 'Cancelled (Partial Refund)'}));
           toast({ title: "Order Cancelled", description: "Your order has been cancelled. A partial refund will be processed as meal prep had begun." });
        } else {
          toast({ variant: "destructive", title: "Cancellation Failed", description: "Cannot cancel order at this stage." });
        }
      };

      if (!order) {
        return <div className="text-center py-10"><Hourglass className="mx-auto h-12 w-12 text-primary animate-pulse" /> <p className="mt-4 text-lg">Loading order details...</p></div>;
      }

      const getStatusColorAndIcon = () => {
        switch (order.status) {
          case 'Pending Confirmation': return { color: 'bg-yellow-500', icon: <Hourglass className="h-5 w-5 text-yellow-100" />, text: 'text-yellow-100' };
          case 'Preparing': return { color: 'bg-blue-500', icon: <Utensils className="h-5 w-5 text-blue-100" />, text: 'text-blue-100' };
          case 'Ready for Pickup': return { color: 'bg-green-500', icon: <CheckCircle className="h-5 w-5 text-green-100" />, text: 'text-green-100' };
          case 'Picked Up': return { color: 'bg-emerald-600', icon: <ShoppingBag className="h-5 w-5 text-emerald-100" />, text: 'text-emerald-100' };
          case 'Cancelled (Full Refund)':
          case 'Cancelled (Partial Refund)':
          case 'Cancelled (No Refund)': return { color: 'bg-red-500', icon: <XCircle className="h-5 w-5 text-red-100" />, text: 'text-red-100' };
          default: return { color: 'bg-gray-500', icon: <Clock className="h-5 w-5 text-gray-100" />, text: 'text-gray-100' };
        }
      };
      const statusStyle = getStatusColorAndIcon();

      const progressValue = () => {
        if (order.status === 'Pending Confirmation') return 25;
        if (order.status === 'Preparing') return 60;
        if (order.status === 'Ready for Pickup') return 90;
        if (order.status === 'Picked Up') return 100;
        if (order.status.startsWith('Cancelled')) return 0;
        return 10;
      };
      
      const userArrivalDateTime = new Date(new Date(order.bookingTime).getTime() + order.userEstimatedArrivalTime * 60 * 1000);
      const mealReadyDateTime = new Date(new Date(order.bookingTime).getTime() + order.estimatedMealReadyTime * 60 * 1000);

      const timeDifference = mealReadyDateTime.getTime() - userArrivalDateTime.getTime();
      let timingStatusMessage = "";
      let timingStatusIcon = <Info size={20}/>;
      let timingStatusColor = "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";

      if (order.status !== "Ready for Pickup" && !order.status.startsWith("Cancelled")) {
        if (timeDifference < -5 * 60 * 1000) { // Meal ready >5 mins AFTER user arrival
            timingStatusMessage = `Heads up! Your meal might be ready about ${Math.abs(Math.round(timeDifference / (60 * 1000)))} minutes after your ETA.`;
            timingStatusIcon = <AlertTriangle size={20}/>;
            timingStatusColor = "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
        } else if (timeDifference > 5 * 60 * 1000) { // Meal ready >5 mins BEFORE user arrival
            timingStatusMessage = `Your meal is on track to be ready about ${Math.round(timeDifference / (60 * 1000))} minutes before your ETA. Perfect!`;
            timingStatusColor = "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
        } else { // Meal ready around user arrival time
            timingStatusMessage = "Excellent timing! Your meal should be ready right around your arrival.";
            timingStatusColor = "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
        }
      }


      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-2xl mx-auto shadow-2xl glassmorphism-card border-primary/30">
            <CardHeader className={`p-6 rounded-t-lg ${statusStyle.color} ${statusStyle.text}`}>
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl font-bold">Order Status</CardTitle>
                {statusStyle.icon}
              </div>
              <CardDescription className={`${statusStyle.text} opacity-80`}>Order ID: {order.id}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-xl font-semibold text-primary">{order.restaurantName}</p>
                <p className="text-muted-foreground">Thank you for your order, {order.userName}!</p>
              </div>

              <div>
                <Label className="text-lg font-medium">Current Status: <span className={`font-bold ${statusStyle.text.replace('100', '700 dark:text-primary-foreground')}`}>{order.status}</span></Label>
                <Progress value={progressValue()} className="w-full mt-2 h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
              </div>
              
              {timingStatusMessage && order.status !== "Ready for Pickup" && !order.status.startsWith("Cancelled") && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-3 rounded-md text-sm flex items-start space-x-2 ${timingStatusColor}`}
                >
                  {timingStatusIcon}
                  <p>{timingStatusMessage}</p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p><strong>Meal Details:</strong> {order.mealDetails}</p>
                <p><strong>Party Size:</strong> {order.partySize}</p>
                <p><strong>Your Estimated Arrival:</strong> {new Date(new Date(order.bookingTime).getTime() + order.userEstimatedArrivalTime * 60000).toLocaleTimeString()}</p>
                <p><strong>Est. Meal Ready Time:</strong> {new Date(new Date(order.bookingTime).getTime() + order.estimatedMealReadyTime * 60000).toLocaleTimeString()}</p>
              </div>

              {order.status === 'Ready for Pickup' && (
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-md text-center">
                  <p className="font-semibold text-green-700 dark:text-green-300">Your meal is ready!</p>
                  <p className="text-sm text-green-600 dark:text-green-400">If you're delayed, your meal will be placed in a Meal Locker (Code: M{order.id.slice(-4)}).</p>
                  <Lock className="h-8 w-8 text-green-500 mx-auto mt-2"/>
                </div>
              )}
              
              {cancellationWindowActive && (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-md text-center">
                  <p className="font-semibold text-yellow-700 dark:text-yellow-300">
                    You can cancel for a full refund within the next {Math.floor(timeLeftForCancellation / 60)}:{(timeLeftForCancellation % 60).toString().padStart(2, '0')} minutes.
                  </p>
                </div>
              )}

              {!cancellationWindowActive && order.status === 'Pending Confirmation' && !order.cookingTriggered && (
                 <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-md text-sm text-blue-700 dark:text-blue-300">
                    <p>The kitchen will be notified to start cooking based on your ETA to ensure freshness.</p>
                 </div>
              )}


            </CardContent>
            <CardFooter className="p-6 bg-transparent border-t border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/restaurants')} className="w-full sm:w-auto">
                Order Again
              </Button>
              {(order.status === 'Pending Confirmation' || order.status === 'Preparing') && (
                <Button 
                  variant="destructive" 
                  onClick={handleCancelOrder} 
                  disabled={order.status === 'Ready for Pickup' || order.status.startsWith('Cancelled')}
                  className="w-full sm:w-auto"
                >
                  {cancellationWindowActive ? 'Cancel (Full Refund)' : order.status === 'Preparing' ? 'Cancel (Partial Refund)' : 'Cancellation Unavailable'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default OrderStatusPage;