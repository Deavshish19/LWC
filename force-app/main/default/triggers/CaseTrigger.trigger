trigger CaseTrigger on Case (after insert) {
	CaseTriggerHandler.handleAfterInsert(trigger.new);
}