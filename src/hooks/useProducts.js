import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  listProducts, createProduct, updateProduct, deleteProduct,
} from '../services/products.js';

/**
 * প্রোডাক্ট লিস্ট + CRUD হুক।
 * const { products, loading, reload, save, remove } = useProducts({ search, categoryId });
 */
export default function useProducts(params = {}) {
  const { search = '', categoryId = '' } = params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await listProducts({ search, categoryId }));
    } catch (e) {
      toast.error('লোড ব্যর্থ: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId]);

  useEffect(() => { reload(); }, [reload]);

  const save = useCallback(async (payload, id) => {
    if (id) await updateProduct(id, payload);
    else await createProduct(payload);
    await reload();
  }, [reload]);

  const remove = useCallback(async (id) => {
    await deleteProduct(id);
    await reload();
  }, [reload]);

  return { products, loading, reload, save, remove };
}
