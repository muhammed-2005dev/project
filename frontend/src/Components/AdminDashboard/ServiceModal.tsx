import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUpload,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { servicesAPI } from "../../services/api";
import toast from "react-hot-toast";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serviceToEdit?: any;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  serviceToEdit,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "Other",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const categories = [
    "engine",
    "transmission",
    "brakes",
    "tires",
    "electrical",
    "ac",
    "diagnostic",
    "oil",
    "other",
  ];

  // Reset or Populate form when opening
  useEffect(() => {
    if (isOpen) {
      if (serviceToEdit) {
        setFormData({
          name: serviceToEdit.name,
          description: serviceToEdit.description,
          price: serviceToEdit.price,
          duration: serviceToEdit.duration,
          category: serviceToEdit.category,
        });
        // Show existing image preview
        if (serviceToEdit.images && serviceToEdit.images.length > 0) {
          setPreviewUrl(serviceToEdit.images[0].url);
        }
      } else {
        // Reset for "Add New"
        setFormData({
          name: "",
          description: "",
          price: "",
          duration: "",
          category: "Other",
        });
        setPreviewUrl(null);
        setImageFile(null);
      }
    }
  }, [isOpen, serviceToEdit]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("duration", formData.duration);
      data.append("category", formData.category);

      if (imageFile) {
        data.append("files", imageFile);
      }

      if (serviceToEdit) {
        await servicesAPI.update(serviceToEdit._id, data);
        toast.success(t("modals.service.successUpdate"));
      } else {
        await servicesAPI.create(data);
        toast.success(t("modals.service.successCreate"));
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto ${
          isRTL ? "rtl" : "ltr"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {serviceToEdit
              ? t("modals.service.editTitle")
              : t("modals.service.addTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("modals.service.image")}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-yellow-500 transition-colors relative cursor-pointer">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-32 mx-auto object-cover rounded"
                />
              ) : (
                <div className="text-gray-400">
                  <FontAwesomeIcon icon={faUpload} className="text-2xl mb-2" />
                  <p className="text-sm">{t("modals.service.clickToUpload")}</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("modals.service.name")}
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("modals.service.category")}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                  {t(`modals.service.categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Price & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("modals.service.price")}
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("modals.service.duration")}
              </label>
              <input
                type="number"
                name="duration"
                required
                min="1"
                value={formData.duration}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("modals.service.description")}
            </label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
          >
            {loading && (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            )}
            {serviceToEdit
              ? t("modals.service.updateBtn")
              : t("modals.service.createBtn")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;
