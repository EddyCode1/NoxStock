export const getAuditUser = (req) => {
  if (!req?.user) {
    return 'sistema';
  }

  return req.user.email || req.user.nombre || req.user.id || 'sistema';
};
