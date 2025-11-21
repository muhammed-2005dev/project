import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSpinner,
  faEnvelope,
  faUser,
  faPhone,
  faTag,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { contactAPI } from "../../services/api";
import toast from "react-hot-toast";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contact: any;
}

const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  contact,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [loading, setLoading] = useState(false);

  if (!isOpen || !contact) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      await contactAPI.updateStatus(contact._id, newStatus);
      toast.success(t("modals.contact.successStatus"));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${
          isRTL ? "rtl" : "ltr"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {t("modals.contact.title")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sender Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-3 text-gray-700">
              <FontAwesomeIcon icon={faUser} className="w-4 text-blue-500" />
              <span className="font-semibold">{contact.name}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="w-4 text-yellow-500"
              />
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-blue-600 text-sm"
              >
                {contact.email}
              </a>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <FontAwesomeIcon icon={faPhone} className="w-4 text-green-500" />
              <span className="text-sm">{contact.phone}</span>
            </div>
          </div>

          {/* Priority & Type */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                {isRTL ? "الأولوية" : "Priority"}
              </label>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="text-red-500 text-sm"
                />
                <p className="font-medium text-gray-900 capitalize">
                  {contact.priority}
                </p>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                {t("modals.contact.type")}
              </label>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faTag}
                  className="text-purple-500 text-sm"
                />
                <span className="font-medium text-gray-900 capitalize">
                  {contact.type}
                </span>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              {t("modals.contact.subject")}
            </label>
            <p className="text-gray-900 font-medium">{contact.subject}</p>
          </div>

          {/* Message Body */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
              {t("modals.contact.message")}
            </label>
            <div className="bg-slate-50 p-4 rounded-lg text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border border-gray-100">
              {contact.message}
            </div>
          </div>

          {/* Status Actions */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t("modals.contact.updateStatus")}
            </label>
            <div className="flex flex-wrap gap-2">
              {["new", "in-progress", "resolved", "closed"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={loading || contact.status === status}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize cursor-pointer ${
                    contact.status === status
                      ? "bg-slate-800 text-white cursor-default"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t(`status.${status}`)}
                </button>
              ))}
            </div>
            {loading && (
              <div className="mt-2 text-center">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin text-yellow-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
