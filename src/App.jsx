import React from 'react';
    import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
    import Layout from '@/components/Layout';
    import HomePage from '@/pages/HomePage';
    import RestaurantsPage from '@/pages/RestaurantsPage';
    import BookingPage from '@/pages/BookingPage';
    import ProfilePage from '@/pages/ProfilePage';
    import OrderStatusPage from '@/pages/OrderStatusPage';
    import { Toaster } from '@/components/ui/toaster';
    import { AppProvider } from '@/context/AppContext';

    function App() {
      return (
        <AppProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/book/:restaurantId" element={<BookingPage />} />
                <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </Layout>
            <Toaster />
          </Router>
        </AppProvider>
      );
    }

    export default App;