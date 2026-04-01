import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const OwnerContext = createContext(null);

export function OwnerProvider({ children }) {
  const [hotels, setHotels]               = useState([]);       // Tất cả KS của owner
  const [selectedHotelId, setSelectedHotelId] = useState(null); // KS đang được chọn để quản lý
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/hotels/my-hotels');
      const list = Array.isArray(res.data) ? res.data : [];
      setHotels(list);

      // Giữ nguyên selection nếu KS đã chọn vẫn tồn tại, không thì chọn cái đầu
      setSelectedHotelId(prev => {
        if (prev && list.find(h => h._id === prev)) return prev;
        return list.length > 0 ? list[0]._id : null;
      });
    } catch (err) {
      console.error('Không thể tải danh sách khách sạn:', err);
      setError('Không thể tải danh sách khách sạn.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  // hotel = KS đang được chọn để quản lý (dùng bởi tất cả trang con)
  const hotel   = hotels.find(h => h._id === selectedHotelId) || null;
  const hotelId = hotel?._id || null;

  return (
    <OwnerContext.Provider value={{
      hotels,             // Toàn bộ danh sách KS của owner
      hotel,              // KS đang chọn (backward compatible)
      hotelId,            // _id của KS đang chọn (backward compatible)
      selectedHotelId,
      setSelectedHotelId, // Cho phép switch sang KS khác
      loading,
      error,
      refreshHotel: fetchHotels,  // backward compatible alias
      refreshHotels: fetchHotels,
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
