trigger OpportunityTrigger on Opportunity (after insert) {

    if(trigger.isAfter && trigger.isInsert){
        OpportunityTypeTrigger.triggerMethod(trigger.new);
    }
}