function addRecommendation() {
  const input = document.getElementById("new_recommendation");
  const text = input.value && input.value.trim();
  if(!text) {
    alert("Please enter a valid recommendation.");
    input.focus();
    return;
  }
  
  const nameInput = document.getElementById("rec_name");
  const name = nameInput && nameInput.value ? nameInput.value.trim() : "";
  // create card with responsive width and fixed height to match design
  const card = document.createElement("div");
  card.className = "recommendation flex flex-col bg-white p-4 rounded-lg shadow-md border border-gray-300 text-gray-700 w-44 h-44 overflow-hidden";

  const row = document.createElement("div");
  row.className = "flex items-start h-full";

  const open = document.createElement("span");
  open.className = "text-xl mr-3 text-purple-800 flex-shrink-0";
  open.textContent = "“";

  const msg = document.createElement("p");
  
  msg.className = "rec-msg flex-1 text-base leading-relaxed whitespace-normal break-words";

  // limit chars to keep consistent box appearance
  // increase max chars to fit the larger box; clamp will still limit visible lines
  const MAX_CHARS = 260;
  if (text.length > MAX_CHARS) {
    msg.textContent = text.slice(0, MAX_CHARS).trim() + '…';
    //Show full text on hover for truncated messages
    msg.title = text; 
  } else {
    msg.textContent = text;
  }

  const close = document.createElement("span");
  close.className = "text-xl ml-3 text-purple-800 flex-shrink-0";
  close.textContent = "”";

  row.appendChild(open);
  row.appendChild(msg);
  row.appendChild(close);
  card.appendChild(row);

  if (name) {
    const nameDiv = document.createElement("div");
    nameDiv.className = "text-sm text-right text-gray-500 mt-2 self-end";
    nameDiv.textContent = `— ${name}`;
    card.appendChild(nameDiv);
  }

  document.getElementById("all_recommendations").appendChild(card);

  input.value = "";
  if (nameInput) nameInput.value = "";

  showPopup(true);
}

function showPopup(bool) {
  const popup = document.getElementById('popup');
  if (bool) {
    popup.classList.remove("hidden");
  } else {
    popup.classList.add("hidden");
  }
}
