import bot from './assets/bot.svg';
import user from './assets/user.svg';


const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
let loadInterval;

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})

// handle message submission
const handleSubmit = async (e) => {
    
    e.preventDefault();
  
    const formData = new FormData(form);
  
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