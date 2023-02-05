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


// on click event for selecting word on a single click
$('#chat_container').on("click", async function (event) {
  event.preventDefault();
  $("span.popup-tag").css("display", "none");
  if (isLoaded) {
    const s = window.getSelection();
    var range = s.getRangeAt(0);
    var node = s.anchorNode;

    // decrease start offset until a white space or puntation is reached or if reached the beginning of the text 
    while (range.toString().indexOf(' ') != 0 && range.startOffset > 0 && !(!!range.toString().charAt(0).match(/^[.,:!?"]/))) {
      range.setStart(node, range.startOffset - 1);
    }

    if (range.toString().indexOf(' ') == 0 || !!range.toString().charAt(0).match(/^[.,:!?"]/)) {
      range.setStart(node, range.startOffset + 1);
    }

    while (
      range.toString().indexOf(' ') == -1 &&
      range.toString().trim() != '' &&
      range.endOffset + 1 < s.baseNode.wholeText.length
      &&
      !(!!range.toString().charAt(range.toString().length - 1).match(/^[.,:!?"]/))
    ) {
      range.setEnd(node, range.endOffset + 1);
    }


    if (!!range.toString().charAt(range.toString().length - 1).match(/^[.,:!?"]/)) {
      range.setEnd(node, range.endOffset - 1);
    }

    // remove extra space
    range.setEnd(node, range.endOffset);
    var str = range.toString().trim();
    // remove last selection if is not letter or number
    const lastChar = range.toString().charAt(range.toString().length - 1);
    if (!/^[a-zA-Z0-9]*$/.test(lastChar)) {
      range.setEnd(node, range.endOffset - 1);
    }
    if (/^[a-zA-Z]*$/.test(range.toString())) {
      str = range.toString().trim();
      if (str != '') {
        $("span.popup-tag").css("display", "block");
        $("span.popup-tag").css("top", event.clientY);
        $("span.popup-tag").css("left", event.clientX);
        $("span.popup-tag").text(str);
      } else {
        $("span.popup-tag").css("display", "none");
      }

    }

  }

});