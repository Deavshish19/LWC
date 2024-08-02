public class InventoryManagement {
	public static void reduceInventory(Map<Id, Integer> productIdToQuantityMap) {
        List<Product2> productsToUpdate = new List<Product2>();
        
        for (Id productId : productIdToQuantityMap.keySet()) {
            Product2 product = [SELECT Id, Quantity_Allocated__c FROM Product2 WHERE Id = :productId FOR UPDATE];
            Integer quantityToReduce = productIdToQuantityMap.get(productId);
            
            product.Quantity_Allocated__c -= quantityToReduce;
            
            productsToUpdate.add(product);
        }
        
        update productsToUpdate;
   }
    public static void replenishInventory(Map<Id, Integer> productIdToQuantityMap) {
        List<Product2> productsToUpdate = new List<Product2>();
        
        for (Id productId : productIdToQuantityMap.keySet()) {
            Product2 product = [SELECT Id, Quantity_Allocated__c FROM Product2 WHERE Id = :productId FOR UPDATE];
            Integer quantityToAdd = productIdToQuantityMap.get(productId);
            
            product.Quantity_Allocated__c += quantityToAdd;
            
            productsToUpdate.add(product);
        }
        
        update productsToUpdate;
    }
}