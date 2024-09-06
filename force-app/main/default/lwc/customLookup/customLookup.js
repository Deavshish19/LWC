import { LightningElement,wire,track,api } from 'lwc';
import searchRecords from '@salesforce/apex/CustomLookupController.searchRecords';

const DELAY = 300;
export default class CustomLookup extends LightningElement {
    @api apiName = "Account";
    searchvalue;
    @api objectLabel = "Account";
    @api iconName = "standard:account";  
    showOutput = false;
    delayTimeout;
    selectedId;
    @track results = [];
    @track selectedRecord = {
        selectedId : '',
        selectedName : ''
    };
    
    @wire (searchRecords, {
        objectApiName : "$apiName",
        searchKey : "$searchvalue"
    })
    outputs({ data, error }) {
        if (data) {
            console.log('test ', data.Name);
            this.results = data;
            this.showOutput = true;
        } else if (error) {
            console.log('error', error);
        }
    }
    get recordSelected(){
        return this.selectedRecord.selectedId === ''? false:true;
    }

    changeHandler(event){
        window.clearTimeout(this.delayTimeout);
        let enteredValue = event.target.value;

        this.delayTimeout = setTimeout(()=>{
            this.searchvalue = enteredValue;
        },DELAY);
        console.log('this.searchvalue' + this.searchvalue);
    }

    handleClick(event){
        let selectedId = event.currentTarget.dataset.item;

        let outputRecord = this.results.find((record) => record.Id === selectedId);
        this.selectedRecord = {
            selectedId : outputRecord.Id,
            selectedName : outputRecord.Name
        };
        this.showOutput = false;  
        this.sendSelection();
    }


    removeSelection(){
        this.selectedRecord = {
            selectedId : '',
            selectedName : ''
        };
        this.sendSelection();
    }

    sendSelection(){
        let mySelectedRecord = new CustomEvent('selectedrec',{
            detail: this.selectedRecord.selectedId
        });
        this.dispatchEvent(mySelectedRecord);
    }
}