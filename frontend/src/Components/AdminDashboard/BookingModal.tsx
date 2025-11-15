import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faCar, faWrench, faUser } from '@fortawesome/free-solid-svg-icons';
import { bookingsAPI, usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  booking: any;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSuccess, booking }) => {
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  // Load technicians when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTechnicians();
      // Pre-select current technician if exists
      if (booking?.technician?._id) {
        setSelectedTechnician(booking.technician._id);
      } else {
        setSelectedTechnician('');
      }
    }
  }, [isOpen, booking]);

  const loadTechnicians = async () => {
    try {
      const response = await usersAPI.getTechnicians();
      setTechnicians(response.data.data.technicians);
    } catch (error) {
      console.error('Failed to load technicians');
    }
  };

  const handleAssign = async () => {
    if (!selectedTechnician) return;
    
    try {
      setLoading(true);
      await bookingsAPI.assignTechnician(booking._id, selectedTechnician);
      toast.success('Technician assigned successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to assign technician');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Booking Details
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Top Row: Customer & Service */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold">
                <FontAwesomeIcon icon={faUser} />
                <h3>Customer Info</h3>
              </div>
              <p className="font-medium">{booking.customer?.firstName} {booking.customer?.lastName}</p>
              <p className="text-sm text-gray-600">{booking.customer?.email}</p>
              <p className="text-sm text-gray-600">{booking.customer?.phone}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-green-700 font-semibold">
                <FontAwesomeIcon icon={faWrench} />
                <h3>Service Details</h3>
              </div>
              <p className="font-medium">{booking.service?.name}</p>
              <p className="text-sm text-gray-600">Price: ${booking.estimatedCost}</p>
              <p className="text-sm text-gray-600">Date: {new Date(booking.appointmentDate).toLocaleDateString()} at {booking.appointmentTime}</p>
            </div>
          </div>

          {/* Car Details */}
          <div className="border rounded-lg p-4">
             <div className="flex items-center gap-2 mb-2 text-gray-700 font-semibold">
                <FontAwesomeIcon icon={faCar} />
                <h3>Vehicle Information</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Make</span>
                  <span className="font-medium">{booking.car?.make}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Model</span>
                  <span className="font-medium">{booking.car?.model}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Year</span>
                  <span className="font-medium">{booking.car?.year}</span>
                </div>
              </div>
          </div>

          {/* Issue Description */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Issue Description</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm">
              {booking.issue?.description}
            </div>
          </div>

          {/* Assign Technician Section */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-800 mb-4">Assign Technician</h3>
            <div className="flex gap-3">
              <select 
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 cursor-pointer"
              >
                <option value="">Select a Technician</option>
                {technicians.map((tech: any) => (
                  <option key={tech._id} value={tech._id}>
                    {tech.firstName} {tech.lastName} ({tech.email})
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleAssign}
                disabled={loading || !selectedTechnician}
                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                Assign
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingModal;