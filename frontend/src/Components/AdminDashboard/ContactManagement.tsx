import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faSearch,
  faTrash,
  faEye,
  faEnvelopeOpen,
} from "@fortawesome/free-solid-svg-icons";
import { contactAPI } from "../../services/api";
import ContactModal from "./ContactModal";
import toast from "react-hot-toast";

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "in-progress" | "resolved" | "closed";
  type: string;
  priority: string;
  createdAt: string;
}

const ContactManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    loadContacts();
  }, [currentPage, statusFilter]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
      };

      const response = await contactAPI.getAll(params);
      setContacts(response.data.data.contacts);
      setTotalPages(response.data.pages);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      await contactAPI.delete(id);
      toast.success("Message deleted");
      loadContacts();
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {isRTL ? "إدارة الرسائل" : "Messages Inbox"}
        </h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Contacts List */}
      <div
        className={`space-y-4 transition-opacity duration-200 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {contacts.map((contact) => (
          <div
            key={contact._id}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Sender & Subject */}
              <div className="flex items-center gap-4 min-w-[250px] flex-1">
                <div
                  className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                    contact.status === "new"
                      ? "bg-red-50 text-red-500"
                      : "bg-blue-50 text-blue-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faEnvelopeOpen} className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {contact.subject}
                  </h3>
                  <p className="text-sm text-gray-600">
                    From: {contact.name} ({contact.email})
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="text-sm text-gray-500">
                {new Date(contact.createdAt).toLocaleDateString()}
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                    contact.status
                  )}`}
                >
                  {contact.status.replace("-", " ")}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedContact(contact);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 size-7.5 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>

                  <button
                    onClick={() => handleDelete(contact._id)}
                    className="text-red-500 hover:text-red-700 size-7.5 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 cursor-pointer"
          >
            Prev
          </button>
          <span className="text-gray-600 px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {contacts.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No messages found.
        </div>
      )}

      {/* Modal */}
      <ContactModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadContacts}
        contact={selectedContact}
      />
    </div>
  );
};

export default ContactManagement;
