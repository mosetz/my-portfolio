const router = location.hostname === "localhost" || location.hostname === "127.0.0.1" ? "http://localhost:5000" : "https://portfolio-contact-api-64q0.onrender.com"

function buildRecommendationCard ({name, message}) {

  const card = document.createElement("div");
  card.className = "recommendation flex flex-col bg-white p-4 rounded-lg shadow-md border border-gray-300 text-gray-700 w-44 h-44 overflow-hidden";

  const row = document.createElement("div");
  row.className = "flex items-start h-full";

  const open = document.createElement("span");
  open.className = "text-xl mr-3 text-blue-800 flex-shrink-0";
  open.textContent = "“";

  const msg = document.createElement("p");

  msg.className = "rec-msg flex-1 text-base leading-relaxed whitespace-normal break-words";

  const MAX_CHARS = 260;
  if (message.length > 260) {
    msg.textContent = text.slice(0, MAX_CHARS).trim() + "…";
    msg.title = message;

  } else {
    msg.textContent = message;
  }

  const close = document.createElement("span");
  close.className = "text-xl mr-3 text-blue-800 flex-shrink-0";
  close.textContent = "”";

  row.appendChild(open);
  row.appendChild(msg);
  row.appendChild(close);

  card.appendChild(row);

  if(name) {
    const nameDiv = document.createElement("div");
    nameDiv.className = "text-sm text-right text-gray-500 mt-2 self-end"
    nameDiv.textContent = `— ${name}`;
    card.appendChild(nameDiv)
  }

  return card;

}

async function loadRecommendations() {
  const container = document.getElementById("all_recommendations");
  container.innerHTML = "";

  const res = await fetch(`${router}/api/recommendations`);
  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Failed to load recommendation")
  }

  data.data.forEach((rec) => {
    container.appendChild(buildRecommendationCard(rec))
  });

}

async function addRecommendation() {
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
  try {
    
    const res = await fetch(`${router}/api/recommendations`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name, message: text})
    });
    
    const data = await res.json();

    if (!res.ok || !data.ok){
      alert(data.error || "Could not submit recommendations");
      return;
    }

    input.value = "";
    if (nameInput) nameInput.value = "";

    await loadRecommendations();
    showPopup(true);

  } catch (err) {
    alert("Server offline/ request failed.")
  }
}

function showPopup(bool) {
  const popup = document.getElementById('popup');
  if (bool) {
    popup.classList.remove("hidden");
  } else {
    popup.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadRecommendations();
  } catch (e) {
    console.error(e);
  }
});