export const successResponse = (res, statusCode, message, data = null) => {
  const body = { success: true, message };

  if (data !== null) {
    body.data = data;
  }

  return res.status(statusCode).json(body);
};

export const errorResponse = (res, statusCode, message, error = null) => {
  const body = { success: false, message };

  if (error) {
    body.error = error;
  }

  return res.status(statusCode).json(body);
};
