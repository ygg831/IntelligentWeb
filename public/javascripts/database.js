import * as idb from './idb/index.js';

let db;

const DB_NAME = 'db_data';
const STORE_NAME = 'store_data';

async function initDatabase() {
    if (!db) {
        db = await idb.openDB(DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(STORE_NAME)) {
                    let dataDB = upgradeDb.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    dataDB.createIndex('data', 'data', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('db created');
    }
}
window.initDatabase = initDatabase;

async function storeData(dataObject){
    console.log('insetting: '+JSON.stringify(dataObject));
    if(!db)
        await initDatabase();
    if(db){
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);
            await store.put(dataObject);
            await tx.complete;
            console.log('added item to the store! '+ JSON.stringify(dataObject));
        } catch (error){
            console.log('error: I could not store the element. Reason: '+error);
        };
    }
    else localStorage.setItem(dataObject.roomNo, JSON.stringify(dataObject));
}
window.storeData = storeData;



async function getData(dataValue){
    if(!db)
        await initDatabase();
    if(db){
        try {
            console.log('fetching: ' + dataValue);
            let tx = await db.transaction(STORE_NAME, 'readonly');
            let store = await tx.objectStore(STORE_NAME);
            let index = await store.index('roomNo');
            let readingsList = await index.getAll(IDBKeyRange.only(dataValue));
            await tx.complete;
            if(readingsList && readingsList.length > 0){
                let max;
                for(let elem of readingsList)
                    addToResults(elem);
            } else {
                const value = localStorage.getItem(dataValue);
                if(value == null){
                    addToResults();
                } else addToResults(value);
            }
        } catch (error) {
            console.log('I could not retrieve the items because: '+error);
        }
    } else {
        const value = localStorage.getItem(dataValue);
        if (value == null)
            addToResults();
        else addToResults(value);
    }
}
window.getData = getData;
