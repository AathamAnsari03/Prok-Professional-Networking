import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout: React.FC = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

export default MainLayout; 