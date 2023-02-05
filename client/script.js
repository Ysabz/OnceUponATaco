import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const span = document.querySelector('definitionBox');
const chatContainer = document.querySelector('#chat_container');
let loadInterval;
let isLoaded = true;

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

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    }
    else {
      isLoaded = true;
      clearInterval(interval)
    }
  }, 20)
}

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
    <div class="message" id = ${uniqueId}> ${value}</div>
    </div>
    </div>
    `
  )
}


const handleSubmit = async (e) => {
  isLoaded = false;
  e.preventDefault();
  const data = new FormData(form);
  var message = data.get('prompt').trim()
  if(message!=''){

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, message);
  form.reset();
  if(message.toLowerCase()!='end'){
  //bot's chatstripe

  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server -> bot's response 

  // const response = await fetch('https://aichatbottest.onrender.com', {
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}else{
  $('#endingModal').modal('show');
}
}
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})

function getSelected() {
  if (window.getSelection) { return window.getSelection(); }
  else if (document.getSelection) { return document.getSelection(); }
  else {
    var selection = document.selection && document.selection.createRange();
    if (selection.text) { return selection.text; }
    return false;
  }
  return false;
}

function getSound() {
  return document.getElementById('checkboxsound').checked
}
async function getDefinition(word) {
  const dictionaryKey = "55e4d7e5-002a-4ac6-87a3-c65d9c3323e8"
  const response = await fetch(`https://dictionaryapi.com/api/v3/references/learners/json/${word}?key=${dictionaryKey}`)
  const data = await response.json();
  console.log(data);
  if (!data.length) { return "Couldn't Find The Word" }
  if (!data[0].shortdef[0]) { return '' }
  var definition = data[0].shortdef[0]
  try { var audio = data[0].hwi.prs[0].sound.audio } catch { }
  if (getSound() && audio) {
    soundRender(audio, dictionaryKey)
  }
  return definition
}

function soundRender(audio, apikey) {
  let subFolder = audio.charAt(0)
  let soundSource = `https://media.merriam-webster.com/soundc11/${subFolder}/${audio}.wav?key=${apikey}`
  let aud = document.getElementById("audioplayer")
  aud.src = soundSource
  aud.controls = true
  aud.setAttribute("autoplay", '')
}
/* create sniffer */

/**$('#chat_container').mouseup(async function (event) {
  var selection = getSelected();
  console.log(selection.toString());
  selection = $.trim(selection);

  if (selection != '') {
    var definition = await getDefinition(selection)
    $("span.popup-tag").css("display", "block");
    $("span.popup-tag").css("top", event.clientY);
    $("span.popup-tag").css("left", event.clientX);
    $("span.popup-tag").text(definition);
  } else {
    $("span.popup-tag").css("display", "none");
  }
});**/

// TODO fix the bug if the last element on the line is selected (DONe)
// TODO disable clicking while the bot is typing
// TODO has a bug on testing 123
$('#chat_container').click(async function (event) {
  $("span.popup-tag").css("display", "none");
  if (isLoaded) {
    const s = window.getSelection();
    var range = s.getRangeAt(0);
    var node = s.anchorNode;

    while (range.toString().indexOf(' ') != 0) {
      range.setStart(node, range.startOffset - 1);
    }

    range.setStart(node, range.startOffset + 1);

    while (
      range.toString().indexOf(' ') == -1 &&
      range.toString().trim() != '' &&
      range.endOffset + 1 < s.baseNode.wholeText.length
    ) {
      range.setEnd(node, range.endOffset + 1);
    }

    // remove extra space
    range.setEnd(node, range.endOffset);
    var str = range.toString().trim();
    console.log("testing", str);
    // remove last selection if is not letter or number
    const lastChar = range.toString().charAt(range.toString().length - 1);
    if (!/^[a-zA-Z0-9]*$/.test(lastChar)) {
      range.setEnd(node, range.endOffset - 1);
    }
    if (/^[a-zA-Z]*$/.test(range.toString())) {
      str = range.toString().trim();
      console.log(str);
      if (str != '') {
        str = await getDefinition(str)
        if (str != '') {
          $("span.popup-tag").css("display", "block");
          $("span.popup-tag").css("top", event.clientY);
          $("span.popup-tag").css("left", event.clientX);
          $("span.popup-tag").text(str);
        }

      } else {
        $("span.popup-tag").css("display", "none");
      }

    }

  }

});


