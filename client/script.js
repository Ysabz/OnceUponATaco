import bot from './assets/bot.svg';
import user from './assets/user.svg';


const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
let loadInterval;
let isLoaded = true;

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})



// handle message submission
const handleSubmit = async (e) => {
  isLoaded = false;
  e.preventDefault();

  const formData = new FormData(form);
  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, formData.get('prompt'));
  form.reset();

  chatContainer.scrollTop = chatContainer.scrollHeight;


  // fetch data from server -> bot's response 
  // const response = await fetch('https://aichatbottest.onrender.com', {
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: formData.get('prompt'),
      type: 'correction'
    })
  })

  clearInterval(loadInterval);


  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    // check there was no grammar mistakes skip this step
    if (parsedData.localeCompare(formData.get('prompt').trim()) != 0) {

      // text correction chatstripe
      const uniqueIdCorrector = generateUniqueId();
      chatContainer.innerHTML += correctionChatStripe(" ", uniqueIdCorrector);



      const messageDiv = document.getElementById(uniqueIdCorrector);

      messageDiv.innerHTML = '';
      typeText(messageDiv, "Correction:" + parsedData, formData, function () { handleCompletion(formData) });
    }
    else {
      handleCompletion(formData);
    }

  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }

}



// show text is loading
function loader(element) {
  element.textContent = '';

  //every 300 milliseconds add . to text conte
  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}


// type the text in message
function typeText(element, text, data, callback) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    }
    else {
      isLoaded = true;
      clearInterval(interval);
      if (callback) callback(data);
    }
  }, 20)
}


// generate unique id
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`
}


function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class = "wrapper ${isAi && 'ai'}">
    <div class= "chat">
    <div class= "profile">
    <img
      src = "${isAi ? bot : user}"
      alt= "${isAi ? 'bot' : 'user'}"
    />
    </div>
    <textarea disabled class="message" id = ${uniqueId}> ${value}</textarea>
    </div>
    </div>
    `
  )
}


function correctionChatStripe(value, uniqueId) {
  return (
    `
    <div class = "wrapper correction">
    <div class= "chat">
    <div class= "profile">
    <img
      src = "${bot}"
      alt= "${'bot'}"
    />
    </div>
    <textarea disabled class="message" id = ${uniqueId}> ${value}</textarea>
    </div>
    </div>
    `
  )
}
