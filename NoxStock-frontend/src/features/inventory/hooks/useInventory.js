import { useCallback, useEffect, useState } from 'react';
import inventoryService from '../../../shared/api/services/inventoryService';

export function useInventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async (params = {}) => {
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
  }, []);

  const loadCategories = useCallback(async () => {
    const data = await inventoryService.getCategories();
    setCategories(data.categories || []);
  }, []);

  const loadMovements = useCallback(async () => {
    const [entriesData, outputsData] = await Promise.all([
      inventoryService.getEntries(),
      inventoryService.getOutputs(),
    ]);

    setEntries(entriesData.entries || []);
    setOutputs(outputsData.outputs || []);
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  return {
    products,
    categories,
    entries,
    outputs,
    loading,
    error,
    loadProducts,
    loadCategories,
    loadMovements,
    inventoryService,
  };
}

export default useInventory;
