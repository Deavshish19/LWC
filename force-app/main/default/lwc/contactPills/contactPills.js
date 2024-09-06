import { LightningElement, track, api } from 'lwc';

export default class ContactPills extends LightningElement {

    @track _contacts = [];
    set contacts(contacts=[]){
        this._contacts = [...contacts];
    }

    @api 
    get contacts(){
        return this._contacts;
    }

    get items(){
        let contactEmailArray = this._contacts.map(currentItem =>{
            return {
                type: 'icon',
                label: currentItem.Email,
                name: currentItem.Email,
                iconName: 'standard:contact',
                alternativeText: 'Contact Email',
            };
        });
        return contactEmailArray;
    }

    handleItemRemove(event) {
        console.log('Inside Remove')
        const name = event.detail.item.name;
        alert(name + ' pill was removed!');
        const index = this._contacts.findIndex(contact => contact.Email === name);
        if (index > -1) {
            // Remove the item from _contacts
            this._contacts.splice(index, 1);
        }
    }
}
