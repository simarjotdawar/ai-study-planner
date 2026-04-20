import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [page, setPage] = useState("home");

  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [reminder, setReminder] = useState("");

  const [subject, setSubject] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [hours, setHours] = useState("");
  const [deadline, setDeadline] = useState("");

  const [notes, setNotes] = useState("");
  const [plan, setPlan] = useState("");

  // 🔐 AUTH
  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      setToken(res.data.token);
      setUserId(res.data.userId);
      setPage("dashboard");
    } catch {
      alert("Login failed");
    }
  };

  const register = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
      });
      alert("Registered! Now login");
      setIsLogin(true);
    } catch {
      alert("Registration failed");
    }
  };

  // 📊 TASKS
  const fetchTasks = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/tasks/${userId}`
    );
    setTasks(res.data);
  };

  const addTask = async (taskText) => {
    if (!taskText) return;

    await axios.post("http://localhost:5000/api/tasks", {
      text: taskText,
      done: false,
      userId,
      reminder,
    });

    setText("");
    setReminder("");
    fetchTasks();
  };

  const toggleTask = async (task) => {
    await axios.put(
      `http://localhost:5000/api/tasks/${task._id}`,
      {
        done: !task.done,
      }
    );
    fetchTasks();
  };

  // 🤖 SMART PLAN (FREE AI)
  const generatePlan = () => {
    if (!subject || !syllabus || !hours || !deadline) {
      return alert("Fill all fields");
    }

    const topics = syllabus.split(",");
    const today = new Date();
    const end = new Date(deadline);

    const totalDays = Math.ceil(
      (end - today) / (1000 * 60 * 60 * 24)
    );

    if (totalDays <= 0) return alert("Invalid deadline");

    let output = "";
    let topicIndex = 0;

    for (let day = 1; day <= totalDays; day++) {
      if (day % 5 === 0) {
        output += `Day ${day}: 🔁 Revision Day\n\n`;
        continue;
      }

      if (topicIndex < topics.length) {
        output += `Day ${day}: Study ${topics[topicIndex].trim()} (${hours} hrs)\n\n`;
        topicIndex++;
      } else {
        output += `Day ${day}: Practice & Mock Test\n\n`;
      }
    }

    setPlan(output);
  };

  // 📚 NOTES GENERATOR (FREE AI)
  const generateNotes = () => {
    if (!subject || !syllabus) {
      return alert("Enter subject & syllabus");
    }

    const topics = syllabus.split(",");

    let output = "";

    topics.forEach((topic) => {
      topic = topic.trim();

      output += `📘 ${topic}\n\n`;
      output += `Definition:\n${topic} is an important concept in ${subject}.\n\n`;

      output += `Key Points:\n`;
      output += `- Basic idea of ${topic}\n`;
      output += `- Applications of ${topic}\n`;
      output += `- Advantages and limitations\n\n`;

      output += `Example:\nReal-life use of ${topic}.\n\n`;

      output += `Important Questions:\n`;
      output += `1. Explain ${topic}\n`;
      output += `2. Write short note on ${topic}\n\n`;
      output += `-----------------------------\n\n`;
    });

    setNotes(output);
  };

  // 🔔 Notification permission
  useEffect(() => {
    Notification.requestPermission();
  }, []);

  // ⏰ Reminder system
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      tasks.forEach((task) => {
        if (task.reminder && !task.done) {
          const time = new Date(task.reminder);

          if (Math.abs(now - time) < 5000) {
            if (Notification.permission === "granted") {
              new Notification("⏰ Reminder", {
                body: task.text,
              });
            }
          }
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [tasks]);

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  const completed = tasks.filter((t) => t.done).length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  // 🌟 HOME
  if (page === "home") {
    return (
      <div style={styles.home}>
        <h1>🚀 AI Study Planner</h1>
        <p>Plan smarter. Study better.</p>
        <button style={styles.button} onClick={() => setPage("auth")}>
          Get Started
        </button>
      </div>
    );
  }

  // 🔐 AUTH
  if (page === "auth") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>{isLogin ? "Login" : "Register"}</h2>

          <input style={styles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

          {isLogin ? (
            <button style={styles.button} onClick={login}>Login</button>
          ) : (
            <button style={styles.button} onClick={register}>Register</button>
          )}

          <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer" }}>
            {isLogin ? "Create account" : "Already have account"}
          </p>
        </div>
      </div>
    );
  }

  // 📊 DASHBOARD
  return (
    <div style={styles.dashboard}>
      <h1>📊 Dashboard</h1>
      <h3>Progress: {progress}%</h3>

      {/* TASK */}
      <h3>Add Task</h3>
      <input style={styles.input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Task" />
      <input style={styles.input} type="datetime-local" onChange={(e) => setReminder(e.target.value)} />
      <button style={styles.button} onClick={() => addTask(text)}>Add</button>

      {/* AI */}
      <h3>🤖 Smart Planner</h3>
      <input style={styles.input} placeholder="Subject" onChange={(e) => setSubject(e.target.value)} />
      <input style={styles.input} placeholder="Syllabus (comma separated)" onChange={(e) => setSyllabus(e.target.value)} />
      <input style={styles.input} type="number" placeholder="Hours/day" onChange={(e) => setHours(e.target.value)} />
      <input style={styles.input} type="date" onChange={(e) => setDeadline(e.target.value)} />

      <button style={styles.button} onClick={generatePlan}>Generate Plan</button>
      <button style={styles.button} onClick={generateNotes}>Generate Notes</button>

      <h3>📅 Plan</h3>
      <pre>{plan}</pre>

      <h3>📚 Notes</h3>
      <pre>{notes}</pre>

      {/* TASK LIST */}
      <div>
        {tasks.map((t) => (
          <div
            key={t._id}
            onClick={() => toggleTask(t)}
            style={{
              padding: 10,
              margin: 10,
              background: t.done
                ? "#c8f7c5"
                : t.reminder && new Date(t.reminder) < new Date()
                ? "#ffcccc"
                : "#fff",
              cursor: "pointer",
            }}
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  home: { height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#4facfe", color: "white" },
  container: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  card: { padding: 30, background: "white", borderRadius: 10 },
  dashboard: { padding: 20 },
  input: { display: "block", margin: "10px 0", padding: 10, width: "100%" },
  button: { padding: "10px 20px", background: "#4facfe", color: "white", border: "none", cursor: "pointer", marginRight: 10 },
};

export default App;