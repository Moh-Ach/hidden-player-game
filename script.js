const rounds = [
  ["🧤", "Goalkeeper", ["Mike Maignan", "Yann Sommer"], ["France", "Switzerland"], [86, 84]],
  ["🛡️", "Center Back", ["Nicolás Otamendi", "Jonathan Tah"], ["Argentina", "Germany"], [79, 80]],
  ["🛡️", "Center Back", ["Gabriel Magalhães", "Matthijs de Ligt"], ["Brazil", "Netherlands"], [86, 84]],
  ["➡️", "Right Back", ["Jeremie Frimpong", "Kieran Trippier"], ["Netherlands", "England"], [84, 79]],
  ["⬅️", "Left Back", ["Nuno Mendes", "Ferland Mendy"], ["Portugal", "France"], [87, 82]],
  ["🧠", "Central Midfield", ["Declan Rice", "Nicolò Barella"], ["England", "Italy"], [87, 86]],
  ["🧠", "Central Midfield", ["Vitinha", "İlkay Gündoğan"], ["Portugal", "Germany"], [88, 82]],
  ["🎩", "Attacking Midfield", ["Cole Palmer", "Florian Wirtz"], ["England", "Germany"], [88, 89]],
  ["⚡", "Right Wing", ["Michael Olise", "Lamine Yamal"], ["France", "Spain"], [84, 89]],
  ["⚡", "Left Wing", ["Khvicha Kvaratskhelia", "Rafael Leão"], ["Georgia", "Portugal"], [86, 87]],
  ["🎯", "Striker", ["Victor Osimhen", "Dušan Vlahović"], ["Nigeria", "Serbia"], [87, 82]]
];

let round = 0;
let yourTeam = [];
let friendTeam = [];
let roundLocked = false;

const $ = id => document.getElementById(id);

function reset() {
  round = 0;
  yourTeam = [];
  friendTeam = [];
  roundLocked = false;

  $("finalPanel").classList.add("hidden");
  $("gamePanel").classList.remove("hidden");
  render();
}

function render() {
  if (round >= rounds.length) {
    finish();
    return;
  }

  const [icon, position, players, countries, ratings] = rounds[round];

  $("roundNumber").textContent = round + 1;
  $("positionName").textContent = position;
  $("positionBadge").textContent = `${icon} ${position.toUpperCase()}`;

  $("announcedName").textContent = players[0];
  $("announcedMeta").textContent = `${countries[0]} • ${position}`;
  $("announcedAvatar").textContent = initials(players[0]);

  $("hiddenName").textContent = "Hidden Player";
  $("hiddenMeta").textContent = "Unknown until revealed";
  $("hiddenAvatar").textContent = "?";

  $("result").classList.add("hidden");
  $("nextBtn").classList.add("hidden");
  $("chooseAnnounced").disabled = false;
  $("chooseHidden").disabled = false;
  roundLocked = false;

  updateLineups();
}

function initials(name) {
  return name
    .split(/\s+/)
    .map(word => word.replace(/[^\p{L}]/gu, ""))
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();
}

function choose(which) {
  if (roundLocked) return;

  const [, position, players, countries, ratings] = rounds[round];
  const announced = {
    name: players[0],
    country: countries[0],
    rating: ratings[0]
  };
  const hidden = {
    name: players[1],
    country: countries[1],
    rating: ratings[1]
  };

  const mine = which === "announced" ? announced : hidden;
  const theirs = which === "announced" ? hidden : announced;

  yourTeam.push({ name: mine.name, position, rating: mine.rating });
  friendTeam.push({ name: theirs.name, position, rating: theirs.rating });

  roundLocked = true;
  $("chooseAnnounced").disabled = true;
  $("chooseHidden").disabled = true;

  // Reveal the hidden player after the decision.
  $("hiddenName").textContent = hidden.name;
  $("hiddenMeta").textContent = `${hidden.country} • ${position} • ${hidden.rating} OVR`;
  $("hiddenAvatar").textContent = initials(hidden.name);

  const won = mine.rating >= theirs.rating;
  $("resultTitle").textContent =
    won ? `Good pick! You got ${mine.name}.` : `Risky pick! You got ${mine.name}.`;
  $("resultText").textContent =
    `${theirs.name} goes to your friend (${theirs.rating} OVR). Your player: ${mine.rating} OVR.`;

  $("result").classList.remove("hidden");
  $("nextBtn").textContent = round === rounds.length - 1
    ? "Finish Game →"
    : "Next Round →";
  $("nextBtn").classList.remove("hidden");

  updateLineups();
}

function next() {
  if (!roundLocked) return;

  round++;
  if (round >= rounds.length) finish();
  else render();
}

function teamAverage(team) {
  if (!team.length) return 0;
  return Math.round(team.reduce((sum, p) => sum + p.rating, 0) / team.length);
}

function updateLineups() {
  $("yourCount").textContent = `${yourTeam.length} / 11`;
  $("friendCount").textContent = `${friendTeam.length} / 11`;

  const renderTeam = team => team.map((p, i) =>
    `<div class="player-row">
      <span><b>${i + 1}.</b> ${escapeHTML(p.name)}</span>
      <small>${escapeHTML(p.position)} • ${p.rating}</small>
    </div>`
  ).join("");

  $("yourPlayers").innerHTML = renderTeam(yourTeam);
  $("friendPlayers").innerHTML = renderTeam(friendTeam);

  $("yourRating").textContent = yourTeam.length ? `${teamAverage(yourTeam)} OVR` : "—";
  $("friendRating").textContent = friendTeam.length ? `${teamAverage(friendTeam)} OVR` : "—";
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function finish() {
  $("gamePanel").classList.add("hidden");
  $("finalPanel").classList.remove("hidden");

  const yourScore = teamAverage(yourTeam);
  const friendScore = teamAverage(friendTeam);

  if (yourScore > friendScore) {
    $("finalTitle").textContent = "🟢 Your XI wins!";
    $("finalText").textContent =
      `Your team finished at ${yourScore} OVR vs ${friendScore} OVR. Nice draft.`;
  } else if (friendScore > yourScore) {
    $("finalTitle").textContent = "🔴 Friend's XI wins!";
    $("finalText").textContent =
      `Your friend finished at ${friendScore} OVR vs ${yourScore} OVR. Time for a rematch 😈`;
  } else {
    $("finalTitle").textContent = "🤝 It's a draw!";
    $("finalText").textContent =
      `Both teams finished at ${yourScore} OVR. Nobody gets to brag today.`;
  }
}

$("chooseAnnounced").addEventListener("click", () => choose("announced"));
$("chooseHidden").addEventListener("click", () => choose("hidden"));
$("nextBtn").addEventListener("click", next);
$("newGameBtn").addEventListener("click", reset);
$("playAgainBtn").addEventListener("click", reset);

reset();
