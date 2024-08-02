trigger OrderItemTrigger on OrderItem (after insert) {
    if(trigger.isAfter){
        if(trigger.isInsert){
            ProductQuantity.calculateTotalQuantity(trigger.new);
        }
    } 
}