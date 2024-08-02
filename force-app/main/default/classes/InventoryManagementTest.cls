@isTest
public class InventoryManagementTest {
    
    @testSetup
    static void setup() {
        List<Product2> products = new List<Product2>();
        products.add(new Product2(Name='Product A', Quantity_Allocated__c=100));
        products.add(new Product2(Name='Product B', Quantity_Allocated__c=200));
        
        insert products;
    }

    @isTest
    static void testReduceInventory() {
        List<Product2> products = [SELECT Id, Quantity_Allocated__c FROM Product2];
        Map<Id, Integer> productIdToQuantityMap = new Map<Id, Integer>();
        
        for (Product2 product : products) {
            productIdToQuantityMap.put(product.Id, 10); 
        }
        InventoryManagement.reduceInventory(productIdToQuantityMap);
        for (Product2 product : [SELECT Id, Quantity_Allocated__c FROM Product2 WHERE Id IN :productIdToQuantityMap.keySet()]) {
            System.assertEquals(90, product.Quantity_Allocated__c, 'Inventory should be reduced by 10');
        }
    }

    @isTest
    static void testReplenishInventory() {
        // Fetch products
        List<Product2> products = [SELECT Id, Quantity_Allocated__c FROM Product2];
        Map<Id, Integer> productIdToQuantityMap = new Map<Id, Integer>();
        
        for (Product2 product : products) {
            productIdToQuantityMap.put(product.Id, 10);
        }
        
        InventoryManagement.replenishInventory(productIdToQuantityMap);
        for (Product2 product : [SELECT Id, Quantity_Allocated__c FROM Product2 WHERE Id IN :productIdToQuantityMap.keySet()]) {
            System.assertEquals(110, product.Quantity_Allocated__c, 'Inventory should be replenished by 10');
        }
    }
}