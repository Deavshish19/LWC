trigger QB_CustomerTrigger on QuickBook_Customer__c (after insert) {
	QB_CustomerTriggerHandler.triggerMethod(trigger.new);
}