import axiosClient from "./axiosClient";

export const getUsers = () => {
  return axiosClient.get("/users");
};

export const getUserById = (id) => {
  return axiosClient.get(`/users/${id}`);
};

export const createUser = (data) => {
  return axiosClient.post("/users", data);
};

export const updateUser = (id, data) => {
  return axiosClient.put(`/users/${id}`, data);
};

export const deleteUser = (id) => {
  return axiosClient.delete(`/users/${id}`);
};