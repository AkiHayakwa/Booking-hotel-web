import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const OwnerContext = createContext(null);

export function OwnerProvider({ children }) {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosClient.get('/hotels/my-hotels')
      .then(res => {
        // Lấy khách sạn đầu tiên của owner (thường chỉ có 1)
        const hotels = res.data;
        if (hotels && hotels.length > 0) {
          setHotel(hotels[0]);
        } else {
          setHotel(null); // Chưa có khách sạn
        }
      })
      .catch(err => {
        console.error('Không thể tải thông tin khách sạn:', err);
        setError('Không thể tải thông tin khách sạn.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Cho phép update hotel từ bên ngoài (sau khi chỉnh sửa thông tin KS)
  const refreshHotel = () => {
    setLoading(true);
    axiosClient.get('/hotels/my-hotels')
      .then(res => {
        const hotels = res.data;
        setHotel(hotels && hotels.length > 0 ? hotels[0] : null);
      })
      .catch(() => setError('Không thể tải thông tin khách sạn.'))
      .finally(() => setLoading(false));
  };

  return (
    <OwnerContext.Provider value={{
      hotel,
      hotelId: hotel?._id || null,
      loading,
      error,
      refreshHotel
    }}>
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  const context = useContext(OwnerContext);
  if (!context) {
    throw new Error('useOwner must be used within an OwnerProvider');
  }
  return context;
}
