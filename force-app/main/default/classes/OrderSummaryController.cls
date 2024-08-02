public with sharing class OrderSummaryController {
    
    @AuraEnabled(cacheable=true)
    public static OrderSummaryWrapper getOrderSummary(Id orderId) {
        OrderSummaryWrapper result = new OrderSummaryWrapper();
        
        // Query for Order details
        Order order = [SELECT Id, OrderNumber, Account.Name, Total_Quantity__c 
                       FROM Order 
                       WHERE Id = :orderId LIMIT 1];
        
        result.order = order;
        
        // Query for Order Items
        List<OrderItem> orderItems = [SELECT Id, Product2.Name, Quantity 
                                      FROM OrderItem 
                                      WHERE OrderId = :orderId];
        
        result.orderItems = orderItems;
        
        return result;
    }
    
    public class OrderSummaryWrapper {
        @AuraEnabled
        public Order order { get; set; }
        
        @AuraEnabled
        public List<OrderItem> orderItems { get; set; }
    }
}