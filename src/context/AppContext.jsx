import React, { createContext, useState, useEffect } from 'react';
    import { useToast } from "@/components/ui/use-toast";

    export const AppContext = createContext();

    const initialRestaurantsData = [
      { id: '1', name: 'The Green Leaf Eatery', cuisine: 'Vegetarian', rating: 4.5, distance: 2.5, prepTime: 15, imageSlug: 'green-leaf-eatery-exterior', menu: [{id: 'm1', name: 'Veggie Burger', price: 8}, {id: 'm2', name: 'Salad Bowl', price: 10}] },
      { id: '2', name: 'Spicy Route Grill', cuisine: 'Indian', rating: 4.2, distance: 5.1, prepTime: 20, imageSlug: 'indian-restaurant-facade', menu: [{id: 'm3', name: 'Chicken Tikka', price: 12}, {id: 'm4', name: 'Naan Bread', price: 3}] },
      { id: '3', name: 'Pasta Paradise', cuisine: 'Italian', rating: 4.8, distance: 0.8, prepTime: 12, imageSlug: 'italian-pasta-place', menu: [{id: 'm5', name: 'Spaghetti Carbonara', price: 14}, {id: 'm6', name: 'Garlic Bread', price: 5}] },
      { id: '4', name: 'Sushi Central', cuisine: 'Japanese', rating: 4.6, distance: 8.3, prepTime: 18, imageSlug: 'sushi-restaurant-modern', menu: [{id: 'm7', name: 'Salmon Nigiri Set', price: 16}, {id: 'm8', name: 'Miso Soup', price: 4}] },
      { id: '5', name: 'Burger Barn', cuisine: 'American', rating: 4.0, distance: 3.7, prepTime: 10, imageSlug: 'classic-burger-joint', menu: [{id: 'm9', name: 'Classic Cheeseburger', price: 9}, {id: 'm10', name: 'Fries', price: 3}] },
      { id: '6', name: 'Taco Town', cuisine: 'Mexican', rating: 4.3, distance: 6.0, prepTime: 15, imageSlug: 'mexican-taco-shop-colorful', menu: [{id: 'm11', name: 'Beef Tacos (3)', price: 10}, {id: 'm12', name: 'Guacamole & Chips', price: 6}] },
    ];
    
    export const AppProvider = ({ children }) => {
      const { toast } = useToast();
      const [restaurants, setRestaurants] = useState(() => {
        const localData = localStorage.getItem('restaurants');
        return localData ? JSON.parse(localData) : initialRestaurantsData;
      });
      const [orders, setOrders] = useState(() => {
        const localData = localStorage.getItem('orders');
        return localData ? JSON.parse(localData) : [];
      });
      const [userProfile, setUserProfile] = useState(() => {
        const localData = localStorage.getItem('userProfile');
        return localData ? JSON.parse(localData) : {
          name: 'Guest User',
          email: 'guest@example.com',
          phone: '',
          address: '',
          avatarUrl: '',
          preferences: {},
        };
      });
      const [recentRestaurants, setRecentRestaurants] = useState(() => {
        const localData = localStorage.getItem('recentRestaurants');
        return localData ? JSON.parse(localData) : [];
      });

      useEffect(() => {
        localStorage.setItem('restaurants', JSON.stringify(restaurants));
      }, [restaurants]);

      useEffect(() => {
        localStorage.setItem('orders', JSON.stringify(orders));
      }, [orders]);

      useEffect(() => {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
      }, [userProfile]);

      useEffect(() => {
        localStorage.setItem('recentRestaurants', JSON.stringify(recentRestaurants));
      }, [recentRestaurants]);

      const addOrder = (order) => {
        setOrders(prevOrders => [order, ...prevOrders]);
      };

      const getOrderById = (orderId) => {
        return orders.find(order => order.id === orderId);
      };

      const getRestaurantById = (restaurantId) => {
        return restaurants.find(r => r.id === restaurantId);
      };
      
      const addRecentRestaurant = (restaurant) => {
        setRecentRestaurants(prev => {
          const newRecents = [restaurant.id, ...prev.filter(id => id !== restaurant.id)];
          return newRecents.slice(0, 5); // Keep only last 5
        });
      };

      const updateUserProfile = (profileData) => {
        setUserProfile(profileData);
      };
      
      const updateOrderStatus = (orderId, newStatus, cookingTriggered = undefined) => {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus, cookingTriggered: cookingTriggered !== undefined ? cookingTriggered : order.cookingTriggered } : order
          )
        );
      };

      const cancelOrder = (orderId, refundType) => {
        let newStatus = '';
        if (refundType === "full") newStatus = "Cancelled (Full Refund)";
        else if (refundType === "partial") newStatus = "Cancelled (Partial Refund)";
        else newStatus = "Cancelled (No Refund)";
        
        updateOrderStatus(orderId, newStatus);
      };


      return (
        <AppContext.Provider value={{ 
          restaurants, 
          orders, 
          addOrder, 
          getOrderById, 
          getRestaurantById,
          userProfile,
          updateUserProfile,
          recentRestaurants,
          addRecentRestaurant,
          updateOrderStatus,
          cancelOrder
        }}>
          {children}
        </AppContext.Provider>
      );
    };