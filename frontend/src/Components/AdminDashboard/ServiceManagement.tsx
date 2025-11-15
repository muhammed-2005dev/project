import ServiceModal from "./ServiceModal";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faSpinner,
  faSearch,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
// FIX: Use new API
import { servicesAPI } from "../../services/api";
import toast from "react-hot-toast";

interface Service {
  _id: string;
  name: string;
  // nameAr: string; // REMOVED
  description: string;
  // descriptionAr: string; // REMOVED
  price: number;
  category: string;
  isActive: boolean;
  // isPopular: boolean; // REMOVED
  images: any[];
  createdAt: string;
}

const ServiceManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      // FIX: Use servicesAPI.getAll
      const response = await servicesAPI.getAll({ limit: 50 });
      setServices(response.data.data.services);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (
      !window.confirm(
        isRTL
          ? "هل أنت متأكد من حذف هذه الخدمة؟"
          : "Are you sure you want to delete this service?"
      )
    ) {
      return;
    }

    try {
      // FIX: Use servicesAPI.delete
      await servicesAPI.delete(id);
      toast.success(
        isRTL ? "تم حذف الخدمة بنجاح" : "Service deleted successfully"
      );
      loadServices();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to delete service");
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      // We must use FormData because our API expects multipart/form-data for PUT requests
      const formData = new FormData();

      // 1. Append the new status
      formData.append("isActive", (!service.isActive).toString());

      // 2. Append the REQUIRED fields to satisfy backend validation
      formData.append("name", service.name);
      formData.append("description", service.description);
      formData.append("price", service.price.toString());
      formData.append("duration", "60"); // or service.duration if you have it (default to 60 to pass validation)
      formData.append("category", service.category);

      // Note: We don't need to re-send the image. The backend keeps the old one if no new file is sent.

      await servicesAPI.update(service._id, formData);

      toast.success(isRTL ? "تم تحديث حالة الخدمة" : "Service status updated");
      loadServices();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update service status");
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter || service.category === categoryFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && service.isActive) ||
      (statusFilter === "inactive" && !service.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    "Engine",
    "Transmission",
    "Brakes",
    "Tires",
    "Electrical",
    "AC",
    "Diagnostic",
    "Oil",
    "Other",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-4xl text-yellow-500 animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {isRTL ? "إدارة الخدمات" : "Services Management"}
        </h2>
        <button
          onClick={() => {
            setEditingService(null);
            setShowModal(true);
          }}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          {isRTL ? "إضافة خدمة" : "Add Service"}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder={isRTL ? "البحث في الخدمات..." : "Search services..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer"
          >
            <option value="">{isRTL ? "جميع الفئات" : "All Categories"}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer"
          >
            <option value="">{isRTL ? "جميع الحالات" : "All Status"}</option>
            <option value="active">{isRTL ? "نشط" : "Active"}</option>
            <option value="inactive">{isRTL ? "غير نشط" : "Inactive"}</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service._id} className="bg-white flex flex-col justify-between rounded-lg shadow-lg p-6">
            <div>
              {service.images && service.images.length > 0 && (
                <div className="mb-4">
                  <img
                    src={service.images[0].url}
                    alt={service.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {service.name}
              </h3>

              <p className="text-gray-600 mb-2 text-sm line-clamp-2">
                {service.description}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-yellow-600 font-bold text-lg">
                  ${service.price}
                </span>
                <span className="text-sm text-gray-500">
                  {service.category}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(service)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                      service.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    } cursor-pointer`}
                  >
                    <FontAwesomeIcon
                      icon={service.isActive ? faToggleOn : faToggleOff}
                      className="text-sm"
                    />
                    {service.isActive
                      ? isRTL
                        ? "نشط"
                        : "Active"
                      : isRTL
                      ? "غير نشط"
                      : "Inactive"}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingService(service);
                      setShowModal(true);
                    }}
                    className="text-green-600 hover:text-green-800 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {isRTL ? "لا توجد خدمات" : "No services found"}
          </p>
        </div>
      )}

      <ServiceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadServices} // This reloads the list after saving
        serviceToEdit={editingService}
      />
    </div>
  );
};

export default ServiceManagement;
