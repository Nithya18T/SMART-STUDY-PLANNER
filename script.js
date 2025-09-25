let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let points = parseInt(localStorage.getItem("studyPoints")) || 0;
const motivationalQuotes = [
  "The secret to getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "Small daily improvements lead to big results.",
  "Push yourself, because no one else is going to do it for you.",
  "Stay positive, work hard, make it happen."
];

document.getElementById("deadline").value = new Date().toISOString().split('T')[0];

function saveTasks() {
  localStorage.setItem("studyTasks", JSON.stringify(tasks));
  localStorage.setItem("studyPoints", points);
}

function randomQuote() {
  document.getElementById("quote").innerText = motivationalQuotes[Math.floor(Math.random()*motivationalQuotes.length)];
}

function renderTasks() {
  const taskContainer = document.getElementById("tasks");
  const archiveContainer = document.getElementById("archive");
  taskContainer.innerHTML = "";
  archiveContainer.innerHTML = "";

  tasks.forEach((task,index)=>{
    const taskDiv = document.createElement("div");
    taskDiv.className = "task" + (task.completed?" completed":"");
    const today = new Date(), deadlineDate = new Date(task.deadline);
    const diffTime = deadlineDate - today, daysLeft = Math.ceil(diffTime/(1000*60*60*24));
    const countdownText = daysLeft>0?`${daysLeft} days left`:(daysLeft===0?"Deadline today!":`Overdue by ${Math.abs(daysLeft)} days`);
    taskDiv.innerHTML = `
      <h3>${task.title} [${task.subject} - ${task.priority}]</h3>
      <p>${task.desc}</p>
      <p><b>Deadline:</b> ${task.deadline} ⏳ (${countdownText})</p>
      <button onclick="toggleComplete(${index})">${task.completed?"Undo":"Mark Done"}</button>
      <button onclick="deleteTask(${index})">Delete</button>
    `;
    if(task.completed) archiveContainer.appendChild(taskDiv);
    else taskContainer.appendChild(taskDiv);
  });
  updateProgress();
  renderTimeline();
  randomQuote();
  showSuggestion();
}

function addTask() {
  const title=document.getElementById("title").value.trim();
  const desc=document.getElementById("desc").value.trim();
  const subject=document.getElementById("subject").value;
  const priority=document.getElementById("priority").value;
  const deadline=document.getElementById("deadline").value;
  if(!title||!deadline){ alert("Title and deadline required!"); return; }
  tasks.push({title,desc,subject,priority,deadline,completed:false});
  saveTasks(); renderTasks();
  document.getElementById("title").value=""; document.getElementById("desc").value="";
}

function toggleComplete(index) {
  tasks[index].completed=!tasks[index].completed;
  if(tasks[index].completed){ points+=10; celebrate(); }
  else points=Math.max(0,points-10);
  saveTasks(); renderTasks(); document.getElementById("points").innerText=`Points: ${points}`;
}

function deleteTask(index) {
  if(tasks[index].completed) points=Math.max(0,points-10);
  tasks.splice(index,1); saveTasks(); renderTasks();
  document.getElementById("points").innerText=`Points: ${points}`;
}

function updateProgress() {
  const completed=tasks.filter(t=>t.completed).length;
  const total=tasks.length;
  const percent=total===0?0:(completed/total)*100;
  document.getElementById("progress").style.width=percent+"%";
  document.getElementById("points").innerText=`Points: ${points}`;
}

// Timeline with priority coloring
function renderTimeline() {
  const timeline=document.getElementById("timeline");
  timeline.innerHTML="";
  const today=new Date();
  tasks.forEach(task=>{
    if(task.completed) return;
    const deadlineDate=new Date(task.deadline);
    const eventDiv=document.createElement("div");
    eventDiv.className="timeline-event "+task.priority.toLowerCase();
    eventDiv.innerText=`${task.title}\n${task.deadline}`;
    eventDiv.setAttribute("data-desc",task.desc);
    timeline.appendChild(eventDiv);
  });
}

// AI-powered suggestion
function showSuggestion() {
  let counts={};
  tasks.forEach(t=>{ if(!t.completed) counts[t.subject]=(counts[t.subject]||0)+1; });
  let suggestionText="All tasks are up to date!";
  if(Object.keys(counts).length>0){
    const maxSubject=Object.keys(counts).reduce((a,b)=> counts[a]>counts[b]?a:b);
    suggestionText=`🤖 Suggestion: Focus on ${maxSubject} next! (${counts[maxSubject]} pending tasks)`;
  }
  document.getElementById("suggestion").innerText=suggestionText;
}

// Confetti effect
function celebrate(){
  for(let i=0;i<30;i++){
    const confetti=document.createElement("div");
    confetti.className="confetti";
    confetti.style.left=Math.random()*window.innerWidth+"px";
    confetti.style.background=`hsl(${Math.random()*360},100%,50%)`;
    confetti.style.animationDuration=(1+Math.random()*1.5)+"s";
    document.body.appendChild(confetti);
    setTimeout(()=> confetti.remove(),2000);
  }
}

// Toggle theme
function toggleTheme(){ document.body.classList.toggle("light"); }

renderTasks();
