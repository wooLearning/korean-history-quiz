const state = {
  bank: null,
  currentSetId: "",
  all: [],
  filtered: [],
  currentIndex: 0,
  solved: new Map(JSON.parse(localStorage.getItem("khqSolved") || "[]")),
};

const $ = (selector) => document.querySelector(selector);

const els = {
  eraFilter: $("#eraFilter"),
  setFilter: $("#setFilter"),
  searchInput: $("#searchInput"),
  shuffleButton: $("#shuffleButton"),
  resetButton: $("#resetButton"),
  scoreText: $("#scoreText"),
  progressText: $("#progressText"),
  progressBar: $("#progressBar"),
  positionText: $("#positionText"),
  eraText: $("#eraText"),
  topicText: $("#topicText"),
  questionText: $("#questionText"),
  answerForm: $("#answerForm"),
  answerInput: $("#answerInput"),
  feedback: $("#feedback"),
  explanationText: $("#explanationText"),
  showAnswerButton: $("#showAnswerButton"),
  prevButton: $("#prevButton"),
  nextButton: $("#nextButton"),
  questionList: $("#questionList"),
  countText: $("#countText"),
  setTitleText: $("#setTitleText"),
};

const normalize = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[()[\]{}'"‘’“”.,·\-\s]/g, "");

const saveSolved = () => {
  localStorage.setItem("khqSolved", JSON.stringify([...state.solved.entries()]));
};

const getCurrent = () => state.filtered[state.currentIndex];

const isCorrect = (question, value) => {
  const user = normalize(value);
  const accepted = [question.answer, ...(question.aliases || [])].map(normalize);
  return accepted.includes(user);
};

const setFeedback = (type, text) => {
  els.feedback.className = `feedback ${type || ""}`.trim();
  els.feedback.textContent = text;
};

const updateScore = () => {
  const currentIds = new Set(state.all.map((q) => q.id));
  const totalSolved = [...state.solved.entries()].filter(([id, solved]) => solved && currentIds.has(id)).length;
  els.scoreText.textContent = `${totalSolved} / ${state.all.length}`;

  const visibleSolved = state.filtered.filter((q) => state.solved.get(q.id)).length;
  const percent = state.filtered.length ? Math.round((visibleSolved / state.filtered.length) * 100) : 0;
  els.progressText.textContent = `${percent}%`;
  els.progressBar.style.width = `${percent}%`;
  els.countText.textContent = `${state.filtered.length}문제`;
};

const renderFilters = () => {
  els.setFilter.innerHTML = state.bank.sets
    .map((set) => `<option value="${set.id}">${set.title}</option>`)
    .join("");
  const eras = ["전체", ...new Set(state.all.map((q) => q.era))];
  els.eraFilter.innerHTML = eras.map((era) => `<option value="${era}">${era}</option>`).join("");
};

const loadSet = (setId) => {
  const selected = state.bank.sets.find((set) => set.id === setId) || state.bank.sets[0];
  state.currentSetId = selected.id;
  state.all = selected.questions;
  state.filtered = [...state.all];
  state.currentIndex = 0;
  renderFilters();
  els.setFilter.value = selected.id;
};

const applyFilters = () => {
  const era = els.eraFilter.value;
  const keyword = normalize(els.searchInput.value);

  state.filtered = state.all.filter((q) => {
    const eraMatch = era === "전체" || q.era === era;
    const haystack = normalize(`${q.prompt} ${q.answer} ${q.topic} ${q.explanation}`);
    return eraMatch && (!keyword || haystack.includes(keyword));
  });

  state.currentIndex = 0;
  render();
};

const renderList = () => {
  els.questionList.innerHTML = state.filtered
    .map((q, index) => {
      const classes = [
        index === state.currentIndex ? "current" : "",
        state.solved.get(q.id) ? "solved" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const status = state.solved.get(q.id) ? "맞힘" : q.era;
      return `<li><button type="button" class="${classes}" data-index="${index}">${index + 1}. ${status} · ${q.topic}</button></li>`;
    })
    .join("");
};

const render = () => {
  updateScore();
  renderList();

  const question = getCurrent();
  if (!question) {
    els.positionText.textContent = "문제 없음";
    els.eraText.textContent = "-";
    els.topicText.textContent = "-";
    els.questionText.textContent = "조건에 맞는 문제가 없습니다.";
    els.explanationText.textContent = "필터나 검색어를 바꿔보세요.";
    setFeedback("", "");
    return;
  }

  els.positionText.textContent = `문제 ${state.currentIndex + 1} / ${state.filtered.length}`;
  els.eraText.textContent = question.era;
  els.topicText.textContent = question.topic;
  const selectedSet = state.bank.sets.find((set) => set.id === state.currentSetId);
  els.setTitleText.textContent = selectedSet?.title || "세트";
  els.questionText.textContent = question.prompt;
  els.answerInput.value = "";
  if (window.matchMedia("(pointer: fine) and (min-width: 641px)").matches) {
    els.answerInput.focus();
  }

  if (state.solved.get(question.id)) {
    setFeedback("correct", `이미 맞힌 문제입니다. 정답: ${question.answer}`);
    els.explanationText.textContent = question.explanation;
  } else {
    setFeedback("", "정답을 입력하고 채점해보세요.");
    els.explanationText.textContent = "정답을 확인하면 간단한 해설이 표시됩니다.";
  }
};

const move = (delta) => {
  if (!state.filtered.length) return;
  state.currentIndex = (state.currentIndex + delta + state.filtered.length) % state.filtered.length;
  render();
};

els.answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = getCurrent();
  if (!question) return;

  if (isCorrect(question, els.answerInput.value)) {
    state.solved.set(question.id, true);
    saveSolved();
    setFeedback("correct", `정답입니다. ${question.answer}`);
    els.explanationText.textContent = question.explanation;
    updateScore();
    renderList();
  } else {
    setFeedback("wrong", "아직 아닙니다. 띄어쓰기 없이도 채점되니 핵심어를 다시 떠올려보세요.");
  }
});

els.showAnswerButton.addEventListener("click", () => {
  const question = getCurrent();
  if (!question) return;
  setFeedback("answer", `정답: ${question.answer}`);
  els.explanationText.textContent = question.explanation;
});

els.prevButton.addEventListener("click", () => move(-1));
els.nextButton.addEventListener("click", () => move(1));

els.shuffleButton.addEventListener("click", () => {
  state.filtered = state.filtered
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
  state.currentIndex = 0;
  render();
});

els.resetButton.addEventListener("click", () => {
  if (!confirm("풀이 기록을 모두 지울까요?")) return;
  state.solved.clear();
  saveSolved();
  render();
});

els.eraFilter.addEventListener("change", applyFilters);
els.setFilter.addEventListener("change", () => {
  loadSet(els.setFilter.value);
  render();
});
els.searchInput.addEventListener("input", applyFilters);
els.questionList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button) return;
  state.currentIndex = Number(button.dataset.index);
  render();
});

const init = async () => {
  const response = await fetch("questions.json");
  state.bank = await response.json();
  loadSet(state.bank.sets[0].id);
  render();
};

init().catch((error) => {
  console.error(error);
  els.questionText.textContent = "문제 데이터를 불러오지 못했습니다.";
  els.explanationText.textContent = "로컬 파일 직접 열기 대신 간단한 웹 서버로 실행해 주세요.";
});
