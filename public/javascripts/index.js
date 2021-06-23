let name = null;
let roomNo = null;
let socket= io.connect('/');
const annotation = new Array();

const service_url = 'https://kgsearch.googleapis.com/v1/entities:search';
const apiKey = 'AIzaSyAG7w627q-djB4gTTahssufwNOImRqdYKM';

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';

    //@todo here is where you should initialise the socket operations as described in teh lectures (room joining, chat message receipt etc.)
    // receive joined message
    socket.on('joined', function (room, userid) {
        if (userid === name) {
            hideLoginInterface(room, userid);
        } else {
            writeOnHistory('<b>' + userid + '</b>' + ' joined room ' + room);
        }
    });
    // receive chat message
    socket.on('chat', function (room, userid, chatText) {
        let who = userid;
        annotation.push(who +': '+ chatText);
        localStorage.setItem(room, annotation);
        if (userid === name) {
            who = 'Me';
        }
        writeOnHistory('<b>' + who + ':</b> ' + chatText);
    });
    if('serviceWorker' in navigator){
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function (){ console.log('Service worker registered');
            })
            .catch(function (err){
                console.log('Fail to register', err);
            });
    }
}

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
    roomNo = Math.round(Math.random() * 10000);
    document.getElementById('roomNo').value = 'R' + roomNo;
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    checkURL(chatText);
    // @todo send the chat message
    socket.emit('chat', roomNo, name, chatText);
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom() {
    serialiseForm();
}

function serialiseForm(){
    let formArray = $("form").serializeArray();
    let data = {};
    for (let index in formArray){
        data[formArray[index].name] = formArray[index].value;
    }
    sendAjaxQuery('/',data);
    event.preventDefault();
}

function sendAjaxQuery(url, data){
    $.ajax({
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        type: 'POST',
        success: function (dataR){
            storeData({name: dataR.name, roomNo: dataR.roomNo, image_url: dataR.image_url});
            transBase64();
            roomNo = document.getElementById('roomNo').value;
            name = document.getElementById('name').value;
            let imageUrl= document.getElementById('image_url').value;
            if (!name) name = 'Unknown-' + Math.random();
            //@todo join the room
            socket.emit('create or join', roomNo, name);

            initCanvas(socket, imageUrl);
            hideLoginInterface(roomNo, name);
            },
        error: function (response){
            alert(response.responseText);
            document.getElementById('connect').style.display = 'none';
            document.getElementById('offline_div').style.display = 'block';
        }
    });
}

/**
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnHistory(text) {
    if (text==='') return;
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    // scroll to the last element
    history.scrollTop = history.scrollHeight;
    document.getElementById('chat_input').value = '';
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;

    let localData = localStorage.getItem(room).split(',');
    for(let i in localData){
        writeOnHistory(localData[i]);
    }
}

function widgetInit(){
    let type= document.getElementById("myType").value;
    if (type) {
        let config = {
            'limit': 10,
            'languages': ['en'],
            'types': [type],
            'maxDescChars': 100,
            'selectHandler': selectItem,
        }
        KGSearchWidget(apiKey, document.getElementById("myInput"), config);
        document.getElementById('typeSet').innerHTML= 'of type: '+type;
        document.getElementById('widget').style.display='block';
        document.getElementById('typeForm').style.display= 'none';
    }
    else {
        alert('Set the type please');
        document.getElementById('widget').style.display='none';
        document.getElementById('resultPanel').style.display='none';
        document.getElementById('typeSet').innerHTML= '';
        document.getElementById('typeForm').style.display= 'block';
    }
}

/**
 * callback called when an element in the widget is selected
 * @param event the Google Graph widget event {@link https://developers.google.com/knowledge-graph/how-tos/search-widget}
 */
function selectItem(event){
    let row= event.row;
    // document.getElementById('resultImage').src= row.json.image.url;
    document.getElementById('resultId').innerText= 'id: '+row.id;
    document.getElementById('resultName').innerText= row.name;
    document.getElementById('resultDescription').innerText= row.rc;
    document.getElementById("resultUrl").href= row.qc;
    document.getElementById('resultPanel').style.display= 'block';
}

function offlineRoom(){
    hideLoginInterface(document.getElementById('roomNo').value, document.getElementById('name').value);
    document.getElementById('typeForm').style.display ='none';
    document.getElementById('image').src = document.getElementById('image_url').value;
}

// check user input, find the image url and jump to another image
function checkURL(text){
    let array = text.split(' ');
    for (let i in array){
        let matchUrl = array[i].match(/https:\/\/.+/);
        if(matchUrl!=null){
            console.log('a image');
            console.log(array[i]);
            document.getElementById('image_url').value = array[i];
            transBase64();
            connectToRoom();
        }else{
            console.log('not a image');
        }
    }
}

//convert the image url into base64 format
function transBase64(){
    let img_url = document.getElementById('image_url').value;
    window.URL = window.URL || window.webkitURL;
    let xhr = new XMLHttpRequest();
    xhr.open("get", img_url, true);
    xhr.responseType = "blob";
    xhr.onload = function (){
        if(this.status==200){
            let blob = this.response;
            console.log("blob", blob);
            let fileReader = new FileReader();
            fileReader.onloadend = function (e){
                let base64 = e.target.result;
                document.getElementById('image_url').value = base64;
            };
            fileReader.readAsDataURL(blob);
        }
    }
    xhr.send();
}

