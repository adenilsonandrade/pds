import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';

function MainLayout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;