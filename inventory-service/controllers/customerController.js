import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getCustomers = async (req, res, next) => {
  try {
    const { q, activo } = req.query;
    const filter = {};

    if (q) {
      filter.nombre = { $regex: q.trim(), $options: 'i' };
    }

    if (activo !== undefined) {
      filter.activo = activo === 'true';
    }

    const customers = await Customer.find(filter).sort({ nombre: 1 });

    return successResponse(res, 200, 'Clientes obtenidos correctamente', {
      total: customers.length,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de cliente inválido', 'INVALID_ID');
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return errorResponse(res, 404, 'Cliente no encontrado', 'CUSTOMER_NOT_FOUND');
    }

    return successResponse(res, 200, 'Cliente obtenido correctamente', { customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);

    return successResponse(res, 201, 'Cliente creado correctamente', { customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de cliente inválido', 'INVALID_ID');
    }

    const customer = await Customer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return errorResponse(res, 404, 'Cliente no encontrado', 'CUSTOMER_NOT_FOUND');
    }

    return successResponse(res, 200, 'Cliente actualizado correctamente', { customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de cliente inválido', 'INVALID_ID');
    }

    const openSales = await Sale.countDocuments({
      customerId: id,
      estado: 'borrador',
    });

    if (openSales > 0) {
      return errorResponse(
        res,
        409,
        'No se puede eliminar un cliente con ventas en borrador',
        'CUSTOMER_HAS_OPEN_SALES'
      );
    }

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return errorResponse(res, 404, 'Cliente no encontrado', 'CUSTOMER_NOT_FOUND');
    }

    return successResponse(res, 200, 'Cliente eliminado correctamente', { customer });
  } catch (error) {
    next(error);
  }
};
