export const hasRole = (user, roleName) =>
    user.roles?.some(r => r.name === roleName);

  export const can = (user, permissionName) =>
    user.permissions?.some(p => p.name === permissionName);
  