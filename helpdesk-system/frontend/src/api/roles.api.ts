import api from "./client";

export const getRoles = () => {
  return api.get("/roles");
};

export const getRole = (
  roleId: number
) => {
  return api.get(
    `/roles/${roleId}`
  );
};

export const getUserAccess = (
  userId: number
) => {
  return api.get(
    `/roles/users/${userId}/access`
  );
};

export const assignRoleToUser = (
  roleId: number,
  userId: number
) => {
  return api.post(
    `/roles/${roleId}/users`,
    {
      userId,
    }
  );
};

export const removeRoleFromUser = (
  roleId: number,
  userId: number
) => {
  return api.delete(
    `/roles/${roleId}/users/${userId}`
  );
};

export const assignPermissionToRole = (
  roleId: number,
  permissionId: number
) => {
  return api.post(
    `/roles/${roleId}/permissions`,
    {
      permissionId,
    }
  );
};

export const removePermissionFromRole = (
  roleId: number,
  permissionId: number
) => {
  return api.delete(
    `/roles/${roleId}/permissions/${permissionId}`
  );
};