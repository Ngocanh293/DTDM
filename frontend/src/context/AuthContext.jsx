import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const logout = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
      if (token) {
        await fetch('https://pcestore.onrender.com/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Lỗi khi logout backend:', err);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAdminAuthenticated');
      localStorage.removeItem('userRole');
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // Ưu tiên adminToken nếu có, nếu không thì dùng userToken
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    
    if (token) {
      setIsLoggedIn(true);
      fetch('https://pcestore.onrender.com/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : (logout(), null))
      .then(data => {
        if (data) {
          setUser({ 
            token, 
            id: data.id,
            name: data.fullName || (data.email ? data.email.split('@')[0] : 'Tài khoản'), 
            email: data.email, 
            role: localStorage.getItem('userRole'),
            avatarUrl: data.avatarUrl
          });
        }
      })
      .catch(err => {
         console.error('Auth check failed:', err);
         logout();
      });
    }
  }, []);

  const login = (token, role, userData = {}, refreshToken = null) => {
    localStorage.setItem('userRole', role);
    
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    if (role === 'ADMIN' || role === 'EMPLOYEE') {
       localStorage.setItem('adminToken', token);
       localStorage.setItem('isAdminAuthenticated', 'true');
    } else {
       localStorage.setItem('userToken', token);
       localStorage.removeItem('isAdminAuthenticated');
    }
    
    setIsLoggedIn(true);
    setUser({ 
      ...userData, 
      token, 
      role,
      name: userData.fullName || userData.name || 'Tài khoản'
    });
  };

  const updateUserInfo = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
