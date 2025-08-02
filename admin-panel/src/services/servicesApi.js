import axiosInstance from "../api/axiosInstance";

/////////////////////// ------ SERVICE CATEGORY APIs ----- ///////////////////////

export const getAllServiceCategories = async () => {
  const response = await axiosInstance.get("/api/admin/service-categories");
  return response.data;
};

export const createNewServiceCategory = async (data) => {
  const response = await axiosInstance.post(
    "/api/admin/service-category/create",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getServiceCategoryDetail = async (categoryId) => {
  const response = await axiosInstance.get(
    `/api/admin/service-category/${categoryId}`
  );
  return response.data;
};

export const updateServiceCategory = async (categoryId, formData) => {
  const response = await axiosInstance.put(
    `/api/admin/service-category/${categoryId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const deleteServiceCategory = async (categoryId) => {
  const response = await axiosInstance.delete(
    `/api/admin/service-category/${categoryId}`
  );
  return response.data;
};

/////////////////////// ------ SERVICE APIs ----- ///////////////////////

export const getAllServices = async () => {
  const response = await axiosInstance.get("/api/admin/services");
  return response.data;
};

export const createNewService = async (data) => {
  const response = await axiosInstance.post("/api/admin/service/create", data);
  return response.data;
};

export const getServiceDetail = async (serviceId) => {
  const response = await axiosInstance.get(`/api/admin/service/${serviceId}`);
  return response.data;
};

export const updateService = async (serviceId, data) => {
  const response = await axiosInstance.put(
    `/api/admin/service/${serviceId}`,
    data
  );
  return response.data;
};

export const deleteService = async (serviceId) => {
  const response = await axiosInstance.delete(
    `/api/admin/service/${serviceId}`
  );
  return response.data;
};
