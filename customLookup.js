/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { LightningElement,api,wire,track} from 'lwc';
import searchLookupData from '@salesforce/apex/CustomLookupController.searchLookupData';
import searchDefaultRecord from '@salesforce/apex/CustomLookupController.searchDefaultRecord';
 
export default class CustomLookup extends LightningElement {
    /* -------------------------------------------------------------------------- */
    /*                               PUBLIC METHODS                               */
    /* -------------------------------------------------------------------------- */
    @api label = '';
    @api fields = [];
    @api placeholder = ''; 
    @api iconName = '';
    @api sObjectApiName = '';
    @api defaultRecordId = ''
    @api recordIdFilter = null;
    @api selectedRecord = {};
    @api isFilter = false;

    /* -------------------------------------------------------------------------- */
    /*                               PRIVATE METHODS                              */
    /* -------------------------------------------------------------------------- */
    @track lstResult = [];
    @track hasRecords = true; 
    @track searchKey=''; 
    @track isSearchLoading = false;
    @track delayTimeout;
    @track isValueSelected;
    @track templateByQuadro = false

    /* -------------------------------------------------------------------------- */
    /*                              LIFECYCLE METHODS                             */
    /* -------------------------------------------------------------------------- */
    connectedCallback(){
        try{
         if(this.defaultRecordId != ''){
            searchDefaultRecord({ recordId: this.defaultRecordId , 'sObjectApiName' : this.sObjectApiName })
            .then((result) => {
                if(result != null){
                    this.selectedRecord = result;
                    this.handelSelectRecordHelper();
                }
            })
            .catch((error) => {
                this.error = error;
                this.selectedRecord = {};
            });
         }
        }catch(er){
            console.log(er)
        }
    }
    /* -------------------------------------------------------------------------- */
    /*                                WIRE METHODS                                */
    /* -------------------------------------------------------------------------- */
    @wire(searchLookupData, { searchKey: '$searchKey' , sObjectApiName : '$sObjectApiName', recordId: '$recordIdFilter',fields : '$fields', isFilter : '$isFilter'})
     searchResult(value) {
        try{
        const { data, error } = value;
        this.isSearchLoading = false;

        if (data) {
             this.hasRecords = data.length == 0 ? false : true; 
             this.lstResult = JSON.parse(JSON.stringify(data)); 
         }
        else if (error) {
            console.log('(error---> ' + JSON.stringify(error));
         }
        }catch(er){
            console.log(er)
        }
    };
    /* -------------------------------------------------------------------------- */
    /*                                   METHODS                                  */
    /* -------------------------------------------------------------------------- */
        
    handleKeyChange(event) {
        this.isSearchLoading = true;
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {this.searchKey = searchKey;}, 300);
    }
    handleRemove(){
        try{
            this.searchKey = '';    
            this.selectedRecord = {};
            this.lookupUpdateParenthandler({id : '',name : ''});
            this.isValueSelected = false;
        }catch(err){
            console.log(err);
        }
         
    }
    handelSelectedRecord(event){   
        try{
            var objId = event.target.getAttribute('data-recid');
            this.selectedRecord = this.lstResult.find(data => data.Id === objId);
            
            this.lookupUpdateParenthandler(this.selectedRecord);
            this.handelSelectRecordHelper();
        }catch(err){
            console.log(err);
        }
    }
    handelSelectRecordHelper(){
        this.template.querySelector('.lookupInputContainer').classList.remove('slds-is-open');
        this.isValueSelected = true; 
    }
    lookupUpdateParenthandler(value){
        const oEvent = new CustomEvent('lookupupdate',{'detail': {selectedRecord: value}});
        this.dispatchEvent(oEvent);
    }
    toggleResult(event){
        const lookupInputContainer = this.template.querySelector('.lookupInputContainer');
        const clsList = lookupInputContainer.classList;
        const whichEvent = event.target.getAttribute('data-source');
        switch(whichEvent) {
            case 'searchInputField':
                clsList.add('slds-is-open');
               break;
            case 'lookupContainer':
                clsList.remove('slds-is-open');    
            break;                    
        }
    }
}
