import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import hotelApi from '../api/hotelApi';
import roomTypeApi from '../api/roomTypeApi';
import roomApi from '../api/roomApi';
import './AdminRoomsPage.css';

export default function AdminRoomsPage() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  
  const [activeTab, setActiveTab] = useState('types'); // 'types' or 'rooms'
  
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Forms state
  const [typeForm, setTypeForm] = useState({ name: '', pricePerNight: '', maxGuests: 2, description: '', imageUrl: '' });
  const [roomForm, setRoomForm] = useState({ roomNumber: '', roomType: '', floor: 1 });

  // 1. Lấy danh sách Hotel
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await hotelApi.getAllAdmin();
        const hotelList = res.data || [];
        setHotels(hotelList);
        if (hotelList.length > 0) {
           setSelectedHotel(hotelList[0]._id);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách khách sạn:", error);
      }
    };
    fetchHotels();
  }, []);

  // 2. Lấy dữ liệu Phòng mỗi khi đổi khách sạn
  const fetchHotelData = async (hotelId) => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const [typesRes, roomsRes] = await Promise.all([
        roomTypeApi.getAllByHotel(hotelId),
        roomApi.getAllByHotel(hotelId)
      ]);
      setRoomTypes(typesRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (error) {
       console.error("Lỗi tải dữ liệu phòng", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelData(selectedHotel);
  }, [selectedHotel]);

  // Handlers cho Loại Phòng
  const openAddTypeModal = () => {
    setTypeForm({ name: '', pricePerNight: '', maxGuests: 2, description: '', imageUrl: '' });
    setShowTypeModal(true);
  };

  const handleSaveType = async (e) => {
    e.preventDefault();
    if(!selectedHotel) return alert("Vui lòng chọn khách sạn trước!");
    
    setSubmitLoading(true);
    const payload = {
      ...typeForm,
      images: typeForm.imageUrl ? [typeForm.imageUrl] : [],
      hotel: selectedHotel
    };

    try {
      await roomTypeApi.create(selectedHotel, payload);
      alert('Tạo loại phòng thành công!');
      setShowTypeModal(false);
      fetchHotelData(selectedHotel);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handlers cho Phòng Vật Lý
  const openAddRoomModal = () => {
    if(roomTypes.length === 0) {
      return alert("Khách sạn này chưa có Loại Phòng. Vui lòng tạo Loại Phòng trước!");
    }
    setRoomForm({ roomNumber: '', roomType: roomTypes[0]._id, floor: 1 });
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if(!selectedHotel) return alert("Vui lòng chọn khách sạn trước!");

    setSubmitLoading(true);
    const payload = {
      ...roomForm,
      hotel: selectedHotel
    };

    try {
      await roomApi.create(selectedHotel, payload);
      alert('Tạo phòng vật lý thành công!');
      setShowRoomModal(false);
      fetchHotelData(selectedHotel);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Xóa tài nguyên
  const handleDeleteType = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa Loại Phòng này? (Các phòng bên trong có thể bị mất truy cập)")) {
      try {
        await roomTypeApi.delete(id);
        fetchHotelData(selectedHotel);
      } catch (err) { alert("Lỗi khi xóa"); }
    }
  }

  const handleDeleteRoom = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa Phòng này?")) {
      try {
        await roomApi.delete(id);
        fetchHotelData(selectedHotel);
      } catch (err) { alert("Lỗi khi xóa"); }
    }
  }


  return (
    <AdminLayout activePath="/admin/rooms" searchPlaceholder="Tìm kiếm loại phòng hoặc số phòng...">
      
      {/* HEADER QUẢN LÝ PHÒNG */}
      <div className="rooms-header">
        <div className="rooms-header__left">
          <div className="rooms-header__icon">
            <span className="material-symbols-outlined">meeting_room</span>
          </div>
          <div>
            <h2 className="admin-page-header__title">Room Management</h2>
            <p className="admin-page-header__sub">Select a hotel to configure its rooms and templates.</p>
          </div>
        </div>
        
        {/* Dropdown Chọn Khách sạn */}
        <select 
          className="rooms-hotel-select"
          value={selectedHotel}
          onChange={(e) => setSelectedHotel(e.target.value)}
        >
          {hotels.length === 0 && <option value="">Chưa có khách sạn nào</option>}
          {hotels.map(h => (
            <option key={h._id} value={h._id}>{h.name} - {h.address?.city}</option>
          ))}
        </select>
      </div>

      {/* TABS VIEW */}
      {selectedHotel && (
        <>
          <div className="rooms-tabs">
            <button 
              className={`rooms-tab ${activeTab === 'types' ? 'active' : ''}`}
              onClick={() => setActiveTab('types')}
            >
              <span className="material-symbols-outlined" style={{fontSize:'1.1rem', marginRight:'6px', verticalAlign:'middle'}}>category</span>
              Room Types
            </button>
            <button 
              className={`rooms-tab ${activeTab === 'rooms' ? 'active' : ''}`}
              onClick={() => setActiveTab('rooms')}
            >
              <span className="material-symbols-outlined" style={{fontSize:'1.1rem', marginRight:'6px', verticalAlign:'middle'}}>key</span>
              Physical Rooms
            </button>
          </div>

          <div className="admin-table-card">
            {/* Header Toolbar */}
            <div className="admin-table-card__header">
               <h3 className="font-bold">{activeTab === 'types' ? `Room Types (${roomTypes.length})` : `Physical Rooms (${rooms.length})`}</h3>
               <button 
                  className="htl-add-btn" 
                  onClick={activeTab === 'types' ? openAddTypeModal : openAddRoomModal}
               >
                  <span className="material-symbols-outlined">add</span>
                  {activeTab === 'types' ? 'Add Room Type' : 'Add Room'}
               </button>
            </div>

            {loading ? (
               <div style={{padding:'2rem', textAlign:'center', color:'var(--text-muted)'}}>Đang tải dữ liệu...</div>
            ) : (
                <>
                {/* ──────────────── BẢNG THÔNG TIN LOẠI PHÒNG ──────────────── */}
                {activeTab === 'types' && (
                  <div className="admin-table-wrap">
                    {roomTypes.length === 0 ? (
                      <div className="rooms-empty-state">
                        <span className="material-symbols-outlined">hotel_class</span>
                        <h3>No Room Types Found</h3>
                        <p>You haven't added any room categories (e.g., Deluxe, Suite) to this hotel yet.</p>
                      </div>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Type Name</th>
                            <th>Description</th>
                            <th>Max Guests</th>
                            <th>Price / Night</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roomTypes.map(rt => (
                            <tr key={rt._id}>
                              <td><strong>{rt.name}</strong></td>
                              <td>{rt.description || '-'}</td>
                              <td>{rt.maxGuests || rt.capacity} Pax</td>
                              <td className="font-bold text-primary">{parseInt(rt.pricePerNight).toLocaleString()} VNĐ</td>
                              <td>
                                <div className="admin-action-group" style={{justifyContent:'flex-end'}}>
                                  <button className="admin-action-btn admin-action-btn--delete" onClick={() => handleDeleteType(rt._id)}>
                                    <span className="material-symbols-outlined">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* ──────────────── BẢNG THÔNG TIN PHÒNG VẬT LÝ ──────────────── */}
                {activeTab === 'rooms' && (
                  <div className="admin-table-wrap">
                    {rooms.length === 0 ? (
                      <div className="rooms-empty-state">
                        <span className="material-symbols-outlined">meeting_room</span>
                        <h3>No Physical Rooms Found</h3>
                        <p>Tạo ít nhất 1 Loại phòng trước, sau đó bạn sẽ có thể tạo các phòng đi kèm chìa khoá thực tế.</p>
                      </div>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Room Number</th>
                            <th>Assigned Type</th>
                            <th>Floor</th>
                            <th>Status</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rooms.map(r => (
                            <tr key={r._id}>
                              <td><strong>{r.roomNumber}</strong></td>
                              <td>{r.roomType ? r.roomType.name : <span style={{color:'red'}}>Chưa gán</span>}</td>
                              <td>Floor {r.floor}</td>
                              <td>
                                <div className={`admin-status admin-status--${r.status === 'available' ? 'active' : 'pending'}`}>
                                  <span className="admin-status__dot" />
                                  {r.status.toUpperCase()}
                                </div>
                              </td>
                              <td>
                                <div className="admin-action-group" style={{justifyContent:'flex-end'}}>
                                  <button className="admin-action-btn admin-action-btn--delete" onClick={() => handleDeleteRoom(r._id)}>
                                    <span className="material-symbols-outlined">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
                </>
            )}
          </div>
        </>
      )}

      {/* ──────────────── MODAL TẠO LOẠI PHÒNG ──────────────── */}
      {showTypeModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <button className="admin-modal-close" type="button" onClick={() => setShowTypeModal(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Tạo Loại Phòng (Room Type)</h3>
              <p className="admin-modal-sub">Định nghĩa bảng giá và sức chứa cho hạng phòng.</p>
            </div>
            
            <form onSubmit={handleSaveType}>
              <div className="admin-form-group">
                <label className="admin-form-label">Tên hạng phòng *</label>
                <input 
                  type="text" className="admin-form-input" required 
                  placeholder="VD: Superior Double"
                  value={typeForm.name} onChange={e => setTypeForm({...typeForm, name: e.target.value})}
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Giá mỗi đêm (VNĐ) *</label>
                  <input 
                    type="number" min="0" className="admin-form-input" required 
                    value={typeForm.pricePerNight} onChange={e => setTypeForm({...typeForm, pricePerNight: e.target.value})}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Sức chứa tối đa (Người) *</label>
                  <input 
                    type="number" min="1" className="admin-form-input" required 
                    value={typeForm.maxGuests} onChange={e => setTypeForm({...typeForm, maxGuests: e.target.value})}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Image URL</label>
                <input 
                  type="url" className="admin-form-input" 
                  placeholder="https://..."
                  value={typeForm.imageUrl} onChange={e => setTypeForm({...typeForm, imageUrl: e.target.value})}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Mô tả</label>
                <textarea 
                  className="admin-form-textarea" rows="2"
                  value={typeForm.description} onChange={e => setTypeForm({...typeForm, description: e.target.value})}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => setShowTypeModal(false)}>Hủy</button>
                <button type="submit" className="admin-btn-submit" disabled={submitLoading}>
                  {submitLoading ? 'Đang lưu...' : 'Lưu Hạng Phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL TẠO PHÒNG VẬT LÝ ──────────────── */}
      {showRoomModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <button className="admin-modal-close" type="button" onClick={() => setShowRoomModal(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Tạo Phòng (Physical Room)</h3>
              <p className="admin-modal-sub">Gán mã phòng thực tế vào Loại Phòng có sẵn.</p>
            </div>
            
            <form onSubmit={handleSaveRoom}>
              <div className="admin-form-group">
                <label className="admin-form-label">Số phòng / Mã phòng *</label>
                <input 
                  type="text" className="admin-form-input" required 
                  placeholder="VD: P101, VIP-02"
                  value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Gán vào Loại Phòng *</label>
                <select 
                  className="admin-form-select" required
                  value={roomForm.roomType} onChange={e => setRoomForm({...roomForm, roomType: e.target.value})}
                >
                  {roomTypes.map(rt => (
                    <option key={rt._id} value={rt._id}>{rt.name} - Giá: {parseInt(rt.pricePerNight).toLocaleString()} VNĐ</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Tầng (Floor)</label>
                <input 
                  type="number" min="0" className="admin-form-input" required 
                  value={roomForm.floor} onChange={e => setRoomForm({...roomForm, floor: e.target.value})}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => setShowRoomModal(false)}>Hủy</button>
                <button type="submit" className="admin-btn-submit" disabled={submitLoading}>
                  {submitLoading ? 'Đang lưu...' : 'Tạo Phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
