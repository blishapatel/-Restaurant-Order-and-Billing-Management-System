/** Resolve table number from bill snapshot, populated order, or legacy shapes */
export const getTableNumber = (order, bill = null) => {
  if (bill?.tableNumber != null) return bill.tableNumber;
  if (!order) return null;
  if (order.tableId && typeof order.tableId === 'object' && order.tableId.tableNumber != null) {
    return order.tableId.tableNumber;
  }
  if (order.tableNumber != null) return order.tableNumber;
  return null;
};

export const formatTableLabel = (order, bill = null) => {
  const num = getTableNumber(order, bill);
  return num != null ? `Table ${num}` : 'Table N/A';
};
