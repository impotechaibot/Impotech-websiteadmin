import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { listOrders, updateOrderStatus, deleteOrder } from '../services/orders.js';

/**
 * অর্ডার লিস্ট + স্ট্যাটাস হুক।
 * const { orders, loading, reload, setStatus, remove } = useOrders({ status, search });
 */
export default function useOrders(params = {}) {
  const { status = '', search = '' } = params;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await listOrders({ status, search }));
    } catch (e) {
      toast.error('লোড ব্যর্থ: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => { reload(); }, [reload]);

  const setStatus = useCallback(async (id, s) => {
    await updateOrderStatus(id, s);
    await reload();
  }, [reload]);

  const remove = useCallback(async (id) => {
    await deleteOrder(id);
    await reload();
  }, [reload]);

  return { orders, loading, reload, setStatus, remove };
}
