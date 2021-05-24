const socket = io('https://superchat-apps.herokuapp.com/');

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
const emojiSuggestion = document.getElementById('emojiSug');

let audio;
let model;
let word_index;
let canStart = 0;
let emoji_dict = {0 : "😅", 1 : "😱", 2 : "😠", 3 : "😢", 4 : "😒", 5 : "😔", 6 : "😳"}

const append = async (name, message, position) => {
    new Promise((resolve, reject) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(position);
        const whooseMessage = document.createElement('sup');
        whooseMessage.innerText = name;
        whooseMessage.classList.add('highlightMsg');
        const whatMessage = document.createElement('div');
        whatMessage.innerText = message;
        messageElement.append(whooseMessage);
        messageElement.append(whatMessage);
        messageContainer.append(messageElement);
        resolve(position);
    }).then(position => {
        console.log(position == 'left');
        let myDiv = document.getElementById("scrollDown");
        myDiv.scrollTop = myDiv.scrollHeight;
        if(position == 'left') {
            audio.play();
        }
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    append('You', `${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = "";
});

let name = prompt("Enter your name to join");

while(!name) {
    name = prompt("Enter your name to join");
}

socket.emit('new-user-joined', name);

socket.on('user-joined', name => {
    append(`${name}`, ' joined the chat', 'left');
});

socket.on('receive', data => {
    append(`${data.name}`, `${data.message}`, 'left');
});

socket.on('left', name => {
    append(`${name}`, ' left the chat', 'left');
});

const addEmoji = (e) => {
    let element = document.getElementById('emojiSug');
    messageInput.value += element.innerText;
};

// model

async function run(){
	const model_url = 'Model/model.json';
	model = await tf.loadLayersModel(model_url);
	// console.log(model.summary());
	console.log('model loaded');

    // console.log(wordIndex);
    fetch("word_index.json")
        .then(response => response.json())
        .then(data => {
            word_index = data;
            // console.log(word_index["<oov>"]);
        })
    audio = new Audio('ting.mp3');
    canStart = 1;
}

async function find() {
    if(!canStart) {
        return;
    }
    let text = messageInput.value;
    text = text.trim().toLowerCase().split(" ");
    // console.log(text);
    if(text.length > 10) {
        text = text.splice(0, text.length-10);
    }
    if(text.length == 1 && text[0] == "") {
        return;
    }
    while(text.length < 10) {
        text.push(0);
    }
    for(let i = 0; i < 10; i++) {
        if(text[i] != 0) {
            if(!word_index[text[i]]) {
                text[i] = 1;
            } else {
                text[i] = word_index[text[i]];
            }
        }
    }

    const tensor = tf.expandDims(text);

	const result = model.predict(tensor);
	let outp = result.dataSync();
	let ind = outp.indexOf(Math.max(...outp));
    const predicted_emoji = emoji_dict[ind];
    // console.log(predicted_emoji);
    emojiSuggestion.innerHTML = predicted_emoji;
}

setInterval(() => {
    find();
}, 1000);

document.addEventListener('DOMContentLoaded', run);