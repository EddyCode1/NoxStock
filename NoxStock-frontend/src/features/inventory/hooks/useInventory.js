import { useCallback, useEffect, useState } from 'react';
import inventoryService from '../../../shared/api/services/inventoryService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';

export function useInventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedWarehouseId, version, isReady } = useWarehouse();

  const loadProducts = useCallback(async (params = {}) => {
    if (!selectedWarehouseId) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await inventoryService.getProducts(params);
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [selectedWarehouseId]);

  const loadCategories = useCallback(async () => {
    const data = await inventoryService.getCategories();
    setCategories(data.categories || []);
  }, []);

  const loadMovements = useCallback(async () => {
    if (!selectedWarehouseId) {
      setEntries([]);
      setOutputs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [entriesData, outputsData] = await Promise.all([
        inventoryService.getEntries(),
        inventoryService.getOutputs(),
      ]);

      setEntries(entriesData.entries || []);
      setOutputs(outputsData.outputs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  }, [selectedWarehouseId]);

  useEffect(() => {
    setProducts([]);
    setEntries([]);
    setOutputs([]);
    setError(null);
  }, [selectedWarehouseId, version]);

  useEffect(() => {
    if (!isReady || !selectedWarehouseId) {
      return;
    }

    loadProducts();
    loadCategories();
  }, [isReady, selectedWarehouseId, version, loadProducts, loadCategories]);

  return {
    products,
    categories,
    entries,
    outputs,
    loading,
    error,
    selectedWarehouseId,
    loadProducts,
    loadCategories,
    loadMovements,
    inventoryService,
  };
}

export default useInventory;
