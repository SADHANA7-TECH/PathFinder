
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyDmp_QBCMEHXumI8xw_dU2_QsAN4Hvv9L8",
  authDomain: "pathfinder-backend-2f596.firebaseapp.com",
  databaseURL: "https://pathfinder-backend-2f596-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pathfinder-backend-2f596",
  storageBucket: "pathfinder-backend-2f596.appspot.com",
  messagingSenderId: "48726360082",
  appId: "1:48726360082:web:9b295a34f808468778d8cb"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


async function fetchLatestResponse() {
  const responsesRef = ref(db, "responses");
  const snapshot = await get(responsesRef);

  const resultDiv = document.getElementById("result");

  if (!snapshot.exists()) {
    resultDiv.innerHTML += "<p>No responses found.</p>";
    return;
  }

  const allResponses = snapshot.val();
  const latestKey = Object.keys(allResponses).pop();
  const answers = allResponses[latestKey].answers;

  let html = "<ul>";
  for (const [q, a] of Object.entries(answers)) {
    html += `<li><strong>${q}</strong>: ${a}</li>`;
  }
  html += "</ul>";

  
  resultDiv.innerHTML += html;
}


async function fetchCareerSuggestion() {
  const aiDiv = document.getElementById("ai-suggestion");
  const loader = document.getElementById("loader");

  loader.style.display = "block";

  try {
    const res = await fetch("http://localhost:3000/career-suggestion");
    const data = await res.json();

    loader.style.display = "none";

    
    let formatted = data.suggestion
      .replace(/#### (.*)/g, "<h4>$1</h4>")
      .replace(/### (.*)/g, "<h3>$1</h3>")
      .replace(/## (.*)/g, "<h2>$1</h2>")
      .replace(/# (.*)/g, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/---/g, "<hr>")
      .split(/\n\n+/)
      .map(block => {
        block = block.trim();
        if (!block) return "";
        if (/^<h[1-4]>/.test(block) || block === "<hr>") return block;

        if (/^- /.test(block)) {
          const items = block.split(/\n/).map(line => `<li>${line.replace(/^- /, "").trim()}</li>`).join("");
          return `<ul>${items}</ul>`;
        }

        return `<p>${block}</p>`;
      })
      .join("");

    aiDiv.innerHTML = `<h2>Career Suggestion & Roadmap</h2>${formatted}`;
  } catch (err) {
    loader.style.display = "none";
    aiDiv.innerText = "Failed to fetch AI suggestion.";
    console.error(err);
  }
}


fetchLatestResponse();
fetchCareerSuggestion();

