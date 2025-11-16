import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../Components/AdminDashboard/AdminDashboard';
import UserDashboard from '../Components/UserDashboard/UserDashboard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get User Data
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // 2. Safety Check: If no data, kick them out
    if (!userJson || !token) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userJson);
      setRole(user.role);
    } catch (error) {
      console.error("Error parsing user data", error);
      localStorage.clear(); // Clear bad data
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return null; // Or a simple loading spinner
  }

  // 3. The Logic Switch
  if (role === 'admin') {
    return <AdminDashboard />;
  } else {
    // Users and Technicians go here
    return <UserDashboard />;
  }
};

export default Dashboard;