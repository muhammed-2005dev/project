import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faEnvelope, faUser, faPhone, faTag } from '@fortawesome/free-solid-svg-icons';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contact: any;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSuccess, contact }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !contact) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      // Using the generic updateStatus method we confirmed in contact.js
      await contactAPI.updateStatus(contact._id, newStatus);
      toast.success('Status updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Message Details
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Sender Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-3 text-gray-700">
              <FontAwesomeIcon icon={faUser} className="w-4" />
              <span className="font-semibold">{contact.name}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <FontAwesomeIcon icon={faEnvelope} className="w-4" />
              <a href={`mailto:${contact.email}`} className="hover:text-blue-600 text-sm">{contact.email}</a>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <FontAwesomeIcon icon={faPhone} className="w-4" />
              <span className="text-sm">{contact.phone}</span>
            </div>
          </div>

          {/* Priority & Type */}
          <div className="flex gap-4">
             <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Priority</label>
                <p className="font-medium text-gray-900">{contact.priority}</p>
             </div>
             <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                <div className="flex items-center gap-2 mt-1">
                   <FontAwesomeIcon icon={faTag} className="text-yellow-500 text-xs" />
                   <span className="text-sm capitalize">{contact.type}</span>
                </div>
             </div>
          </div>

          {/* Message Body */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Message</label>
            <div className="bg-slate-50 p-4 rounded-lg text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border border-gray-100">
              {contact.message}
            </div>
          </div>

          {/* Status Actions */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Update Status</label>
            <div className="flex flex-wrap gap-2">
              {['new', 'in-progress', 'resolved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={loading || contact.status === status}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                    contact.status === status
                      ? 'bg-slate-800 text-white cursor-default'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } cursor-pointer`}
                >
                  {status.replace('-', ' ')}
                </button>
              ))}
            </div>
            {loading && <div className="mt-2 text-center"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-yellow-500" /></div>}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactModal;