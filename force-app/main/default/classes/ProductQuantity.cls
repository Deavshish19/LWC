public class ProductQuantity {

    public static void calculateTotalQuantity(List<OrderItem> newOrderItems) {
        Set<Id> orderIds = new Set<Id>();

        for (OrderItem oi : newOrderItems) {
            orderIds.add(oi.OrderId);
        }

        Map<Id, Decimal> orderIdToTotalQuantityMap = new Map<Id, Decimal>();

        List<OrderItem> allOrderItems = [SELECT OrderId, Quantity FROM OrderItem WHERE OrderId IN :orderIds];

        for (OrderItem oi : allOrderItems) {
            if (!orderIdToTotalQuantityMap.containsKey(oi.OrderId)) {
                orderIdToTotalQuantityMap.put(oi.OrderId, 0);
            }
            orderIdToTotalQuantityMap.put(oi.OrderId, orderIdToTotalQuantityMap.get(oi.OrderId) + oi.Quantity);
        }

        List<Order> ordersToUpdate = new List<Order>();

        for (Id orderId : orderIdToTotalQuantityMap.keySet()) {
            Order orderToUpdate = new Order(
                Id = orderId,
                Total_Quantity__c = orderIdToTotalQuantityMap.get(orderId)
            );
            ordersToUpdate.add(orderToUpdate);
        }

        if (!ordersToUpdate.isEmpty()) {
            update ordersToUpdate;
        }
    }
}