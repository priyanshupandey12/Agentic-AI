# My Agentic Engineering Learning Log

**Roadmap:** Ayush Singh, *Agentic Engineering Roadmap For Beginners* (https://youtu.be/dt1eK_4rCAM)
**Stack:** TypeScript + Node.js + Gemini SDK (free tier)
**Goal:** understand, not rush.

**Tags:** ✅ I understand this · 🔁 REVISIT (I have less idea, read again)

---

## The big picture: one system, improved 8 times

| # | Project | Problem it solves | Status |
|---|---|---|---|
| 1 | Model-powered app | We have nothing yet | ⬜ |
| 2 | RAG | The model only knows old training data | ⬜ |
| 3 | Tools + safety rules | The model can only talk, not do things | ⬜ |
| 4 | Memory | The app forgets everything when closed | ⬜ |
| 5 | Durable workflows | A crash loses all progress | ⬜ |
| 6 | Testing + tracing | I can't prove it works | ⬜ |
| 7 | Deployment | Only I can use it | ⬜ |
| 8 | Final project | Put it all together | ⬜ |

---

## 🔁 My revisit list

Tick the box when it makes sense to me.

- [ ] **How the model writes a full answer** (Day 1, Q3 + Q5)
- [ ] **What temperature really does** (Day 1, Q5)
- [ ] **Context window** (Day 1, Q7)
- [ ] **The model does NOT learn while it works** (Day 1, Q11, Q12, Q14). Most important.
- [ ] **How an agent stops** (Day 1, Q14)
- [ ] **What to do when a tool fails** (Day 1, Q15)
- [ ] **Checking data at runtime** (rated 3/5). TypeScript types disappear when the code runs, so data from the model must be checked by my code. We learn this properly on Day 7 (Zod).
- [ ] **Model experiment** (Day 2): run `run-curl.cmd` a few times. Always 3.6 = alias/redirect. Changes = routing under load.
- [ ] **Optional:** does the SDK use the same `usage` field names as raw curl, or does it rename them?
- [ ] **Status codes** (Day 2, Q2). 2xx = OK, 4xx = MY mistake, 5xx = SERVER's mistake.
- [ ] **Forgetting `await`** (Day 2, Q8). I get a Promise (a receipt), not the answer.
- [ ] **What an SDK is, and what it hides** (Day 2, Q9 + Q10)

---

## Day 1: What an LLM is, and what makes something an agent
**Date:** 2026-11-04

### The main idea of the day
The LLM can only **write text**. It cannot do anything by itself.
**My code** does the real work (calling tools, saving data, sending emails).

An **agent** = an LLM + tools + a loop, where **the model chooses the next step** and **my code decides what is allowed**.

---

### Part 1: What is an LLM?

**Q1. What does an LLM do with my text?** ✅
1. It cuts my text into small pieces called **tokens**.
2. Each token becomes a list of numbers (an **embedding**).
3. The **transformer** reads all tokens. Inside it, **attention** helps each word understand its meaning from the words before it.
   Example: "bank" means something different after "river" and after "money".
4. At the end, it gives a **probability for every possible next token**.
5. One token is picked. That is the output.

Small fixes to remember:
- Attention does not pick the next word. It only helps each word understand its meaning.
- "Multi-head" means many attention parts work **at the same time**, and each one looks for a different kind of link (grammar, who "she" is, etc.).

**Q2. What is a token?** ✅
A small piece of text, like "un", "believ", "able".
Each token has a number called a **token ID**.
Token = the piece. Token ID = its number.

**Q3. How does it write a full paragraph?** 🔁 REVISIT
It is a simple loop:
1. Predict the next token.
2. Add it to the text.
3. Go back to step 1.

It stops when:
- the model picks a special **"end" token**, or
- it hits the **max token limit** (then the answer gets cut off in the middle).

Note: attention is *how* one guess is made. The loop is *how many* guesses make a paragraph. These are two different things.

**Q4. Where does its knowledge come from? Why a cutoff date?** ✅
It learns from a huge amount of text (internet, books, code).
Data is collected only up to a certain date, so it knows nothing after that. This is the **cutoff date**.
Training has two stages:
- **Pre-training:** learns to continue any text.
- **Post-training:** learns to behave like a helpful assistant.

Because of the cutoff, we need **Project 2 (RAG)** to give it fresh information.

---

### Part 2: Three important facts about LLMs

**Q5. Why does the same question give different answers?** 🔁 REVISIT
The model gives a list of possible next words with chances:
"blue" 70%, "clear" 20%, "falling" 10%.
Then it **rolls a dice** to pick one. That is why answers change.

**Temperature** changes how the dice works:
- **Low (near 0):** almost always picks the top word. Answers are stable.
- **High:** picks less likely words more often. Answers are more creative and random.

Temperature is NOT about saving tokens or making answers polished.

**Q6. Does the LLM remember my last message?** ✅
No. The model remembers **nothing** between calls.
The **app** saves the chat and sends the **whole chat again** every time.
So the memory is in the app, not in the model. (This is **Project 4**.)

**Q7. What is a context window?** 🔁 REVISIT
Think of it as a **desk** that holds only a fixed number of pages.
- The **context window** = the size of the desk (a token limit).
- The **chat, instructions and tool results** = the pages my app puts on the desk.
- The model can read **only what is on the desk**.

If there are too many pages:
- the request fails, or
- my app removes or summarizes old pages.

Three different problems (do not mix them):
- **Too long:** it does not fit.
- **Lost in the middle:** it fits, but the model pays less attention to the middle.
- **Hallucination:** the model says something false. This can happen even with a short chat.

**Q8. Can an LLM browse the web or send email by itself?** ✅
No. It can only **write a request**.
My code (a tool) does the real work.
ChatGPT can browse only because its app gives it a browsing tool.

---

### Part 3: From LLM to agent

**Q9. Chatbot vs. workflow vs. agent** ✅
- **Chatbot:** I ask, it answers, done.
- **Workflow:** **my code** decides the steps in a fixed order. (It can still use an LLM inside.)
  Example: making tea. Boil water, add tea, add milk, done. Same steps every time.
- **Agent:** **the model** decides the next step while it runs.
  Example: a cook who opens the fridge and decides what to make based on what is inside.

**Q10. What is a tool?** ✅
A normal function, like `getWeather(city)`.
- The model never sees the code. It sees only a **short description**: name, what it does, inputs.
- If the description is bad, the model will use the tool badly.

The full journey:
1. The model **asks** for the tool.
2. My code **checks** the request.
3. My code **runs** the tool.
4. My code **sends the result back** to the model.

**Q11. What is Thought → Action → Observation?** 🔁 REVISIT
- **Thought:** the model writes its plan as text. "I need Delhi's weather first."
- **Action:** the model writes a tool request. `getWeather(Delhi)`
- **Observation:** my code runs the tool and gives the **result** back. "Delhi = 29°C"

Observation is just **the result of the action**. It is NOT the model learning.

**Q12. Why must the observation go back to the model?** 🔁 REVISIT
So the next step is based on **real data**, not a guess.
Without it, the model would **make up** the answer (hallucination).
It helps **this task right now**, not the next time.

**Q13. Who decides the next step?** ✅
- **Agent:** the model decides.
- **Workflow:** my code decides.

---

### Part 4: When things go wrong

**Q14. How does an agent stop?** 🔁 REVISIT
1. **Normal stop:** the model says "I'm done" and gives the final answer.
2. **Safety stop:** my code stops it after a max number of loops (also a time limit or cost limit).

Two different limits:
- **Retry limit:** how many times to retry **one failed tool call**.
- **Loop limit:** how many steps the **whole agent** can take.

⚠️ **The model does NOT learn while it works.**
The model never changes during use. It does not improve "next time" by itself.
If I want it to remember a lesson, **my app** must save the note and give it back next time. That is memory (**Project 4**).

**Q15. What if a tool fails?** 🔁 REVISIT
- My code sends a **clear error** back to the model: "Shimla weather: service down."
- **Danger:** the model may **make up** a temperature for Shimla.
- A good answer says it openly: "Shimla is unknown."
- Other options: try again after a short wait, or tell the user.

**Q16. Can the model use any tool it wants?** ✅
No. **The model asks, my code decides.**
- Every request is checked: Is it allowed? Are the inputs correct? Does it need human approval?
- Risky actions (payments, database changes, sending email) should need **human approval**.

This is **Project 3**.

---

### Part 5: Good judgment

**Q17. When should I NOT build an agent?** ✅
When the steps are known and fixed. Then a **workflow** is better.
Agents are:
- slower
- more expensive
- less predictable
- harder to debug

Use an agent only when the task really needs flexibility.

**Q18. Was the "warmest city" task an agent or a workflow?** ✅
It can be a **workflow**. The steps are fixed: get weather for 3 cities, compare, answer.
No need for the model to decide anything. A workflow is cheaper and safer here.

**Q19. Why does Project 1 start with a plain SDK, not a framework?** ✅
A framework hides what really happens.
First I must see the basics myself: what I send, what comes back, how errors happen.
Then later, when I use a framework, I will know what it is doing for me.

**Q20. One-line summary** ✅
> An agent is an LLM in a loop, using tools. The model chooses the next step. My code decides what is allowed.

---

### Quick self-check questions (for revisit)
- If temperature is 0 and I ask the same question twice, will I get the same answer? Why?
- An answer stops in the middle of a sentence. What probably happened?
- In the locked-room exercise, what is the "desk" and what are the "pages"?
- My agent failed on Monday. On Tuesday, with no saved notes, does it remember? Why not?

### Paper exercise: the locked-room genius
- Not done yet. 🔁 REVISIT

### Resources
- [ ] 3Blue1Brown, LLMs explained briefly: https://3blue1brown.substack.com/p/large-language-models-explained-briefly
- [ ] Karpathy, Intro to LLMs (first 20 min, YouTube)
- [ ] Anthropic, Building Effective Agents: https://www.anthropic.com/research/building-effective-agents
- [ ] Hugging Face Agents Course, Unit 1: https://huggingface.co/learn/agents-course/unit1/what-are-agents
- [ ] Hugging Face, Thought-Action-Observation: https://huggingface.co/learn/agents-course/unit1/agent-steps-and-structure
- [ ] Jay Alammar, The Illustrated GPT-2: https://jalammar.github.io/illustrated-gpt2/
- [ ] Hugging Face, How to generate text (temperature): https://huggingface.co/blog/how-to-generate
- [ ] Anthropic docs, Context windows: https://docs.claude.com/en/docs/build-with-claude/context-windows

### TypeScript basics check (rate 1–5 before Day 2)
| Topic | My rating |
|---|---|
| async / await | 5|
| Objects, arrays, JSON | 4|
| Types and interfaces | 4|
| Checking data at runtime |3 |
| while loops, try/catch | 5|

---

## Day 2: The SDK is just HTTP ✅ DONE
**Date:** 2026-11-07

### The main idea of the day
When I call the Gemini SDK, it secretly sends a normal **web request** (HTTP) to Google and waits for a **web response**.
The SDK is like a **waiter**: it takes my order, writes it in the right format, brings back the food, and tells me if something went wrong.

```
My code  →  SDK (waiter)  →  HTTP request  →  Google's server
My code  ←  SDK (waiter)  ←  HTTP response ←  Google's server
```

---

### Part 1: How the web talks

**Q1. What is an HTTP request? Its 4 parts?** ✅
HTTP = HyperText Transfer Protocol. The rules a client and a server use to talk over the internet.
1. **Method:** what I want to do. GET (read), POST (send/create), PUT/PATCH (update), DELETE (remove). LLM calls use **POST**.
2. **URL:** the address I am sending to.
3. **Headers:** extra info about the request. Most important for me:
   - **API key**: who I am
   - **Content-Type: application/json**: "my body is JSON"
4. **Body:** the data I send. **My prompt goes here.**

**Q2. What is a response? What is a status code?** 🔁 REVISIT
The response is what the server sends back after it handles my request.
It has a **status code** (a number for "how did it go") and a **body** (the answer).

| Code | Meaning | Whose fault | Retry? |
|---|---|---|---|
| 200 | OK, success | nobody | no need |
| 201 | Created (something new was made) | nobody | no need |
| 400 | Bad request: my request is wrong | mine | ❌ no, fix it |
| 401 | Unauthorized: "who are you?" (bad or missing key) | mine | ❌ no, fix the key |
| 403 | Forbidden: "I know you, but you're not allowed" | mine | ❌ no |
| 404 | Not found: wrong URL or wrong model name | mine | ❌ no |
| 429 | Too many requests (rate limit) | mine (too fast) | ✅ yes, after waiting |
| 500 / 503 | Server error | server's | ✅ yes, after waiting |

**Memory trick:** 2xx = OK · 4xx = **my** mistake · 5xx = **server's** mistake.
Only retry when waiting can help (429 and 5xx). This becomes **Day 6**.

My mix-ups: I said 200 = "created" (that's 201), 400 = "valid" (it means NOT valid), 404 = "bad request" (that's 400; 404 is "not found").

**Q3. What is JSON and why do APIs use it?** ✅
JSON = **JavaScript Object Notation**.
It is a simple **text format** that every programming language can read and write.
The client and server may use different languages, so JSON is the common language between them.
- Sending: my object → turned into JSON text
- Receiving: JSON text → turned back into an object (this is called **parsing**)

---

### Part 2: The API key

**Q4. What is an API key? Why does Google need it?** ✅
It has two jobs:
1. **Who am I?** It proves the request comes from me (authentication).
2. **Counting.** Google counts my requests and tokens against my free-tier limits. When I go over, I get **429**.

**Q5 + Q6. Why never put the key in code? What are .env and .gitignore?** ✅
- If the key is in my code and the code goes online (GitHub), anyone can use my key.
- **.env** keeps the key **out of my code**. My code reads it from the environment.
- **.gitignore** keeps the .env file **out of GitHub**.
- I need **both**. .env alone does not stop a leak if I upload the .env file.

---

### Part 3: Why the call is async

**Q7. Why is an LLM call async?** ✅
The answer takes seconds to come back, and I don't know exactly how long.
JavaScript has only **one thread**. If it just waited, the whole program would freeze.
With async, JavaScript hands the waiting to the system and keeps doing other work.
When the answer arrives, the **event loop** puts the next step back on the **call stack** once the stack is empty.
(Small detail: Promises use the **microtask queue**, which runs before the normal callback queue.)

**Q8. What if I forget `await`?** 🔁 REVISIT
It usually does **not** give an error, and it is **not** null.
I get a **Promise**: a receipt that says "the answer is coming later".
- Printing it shows: `Promise { <pending> }`
- Reading `.text` on it gives: `undefined`
- If the call fails later, the error may show up as an "unhandled rejection", far from where the real mistake is.

**Analogy:** I order a pizza and get a receipt. Without `await`, I try to eat the receipt.

---

### Part 4: SDK vs. raw HTTP

**Q9. What is an SDK?** 🔁 REVISIT
An SDK is a **library** (ready-made code I install with npm) that talks to the API **for me**.
It is NOT a different way to communicate. It uses **HTTP underneath**.

Three layers, do not mix them:
- **HTTP** = the road (how data travels)
- **API** = the menu (which requests Google's server accepts)
- **SDK** = the waiter (helper code in my language that uses the road to order from the menu)

What the Gemini SDK does for me:
1. Builds the correct URL
2. Adds my API key to the headers
3. Turns my object into JSON (request)
4. Turns the JSON answer back into an object (response)
5. Gives me TypeScript types and autocomplete
6. Turns bad status codes (401, 429...) into errors I can `catch`
7. May **retry** some failures automatically, and helps with streaming

**Q10. What does an SDK hide? Why does Ayush want me to see it?** 🔁 REVISIT
It hides:
- the exact URL and headers
- the raw JSON shape
- the real status code
- **automatic retries**. A call may take 20 seconds because the SDK quietly retried a 429, and I would not know.
- default timeouts

Why see it:
- When something breaks, the real reason is usually an HTTP thing (a status code, a header, a timeout).
- Project 1 is "done" only when I can **inspect what happened in any request**. I can't inspect what I can't see.
- Each layer hides the one below: **Framework (LangGraph) → SDK → HTTP → server.** If I learn from the bottom up, nothing is magic.

**Analogy:** driving an automatic car is easy. But when it breaks down, the person who understands the engine can fix it.

---

### Quick self-check questions (for revisit)
- My call returns 401. Should I retry? What should I check?
- My call returns 429. Should I retry? Right away or after waiting?
- I print my result and see `Promise { <pending> }`. What did I forget?
- Name 3 things the SDK does for me that I would have to do myself with raw HTTP.

### Hands-on (to do)
- [x] Step 1: Setup (API key, Node, npm project in `project-1/`, .env, .gitignore) ✅
- [x] Step 2: Run the raw REST request with `curl.exe` (through `project-1/run-curl.cmd`) ✅
- [x] Step 3: Write my own SDK call (`project-1/learning.ts`). Prints the whole response, including token usage ✅
- [x] Step 4: Break it on purpose ✅

| What I broke | Status code | What the error said |
|---|---|---|
| Wrong API key |401 |API key not valid. Please pass a valid API key |
| Key not loaded | |API key should be set when using the Gemini API |
| Model name with a typo |404 |Model Not Found |
| Removed `await` | | undefined|
| Wi-Fi off | | fetch failed|

### What the "break it" table taught me: 3 kinds of failure
Only some errors have a status code. That tells me **where** it broke.

| Kind | When it breaks | Status code? | My examples | Retry? |
|---|---|---|---|---|
| **1. Before sending** | My code/config is wrong, so the request never leaves my computer | ❌ none | Key not loaded | ❌ no, fix my setup |
| **2. On the road** | The request leaves but no answer ever comes back | ❌ none | Wi-Fi off ("fetch failed"), timeouts | ✅ yes, after waiting |
| **3. Server says no** | The server answers, but with an error | ✅ yes | 401 wrong key, 404 bad model name | ❌ no for 4xx (except 429), ✅ yes for 429 / 5xx |

- **Removed `await` → undefined.** Not an error. I read `.output_text` from a Promise (the receipt), and a receipt has no `.output_text`. Exactly the pizza example from Q8. The request was still sent; I just didn't wait for it.
- This table is the starting point for **Day 6 (failures and retries)**.

### What I saw in the raw request and response (curl)

**First try:** "too much load / not available" → Google's server was busy (a **5xx**, server's mistake). Waiting or switching model fixed it. A real app should **wait and retry** (Day 6).

**The request I sent:**
- Method: `POST`
- URL: `https://generativelanguage.googleapis.com/v1beta/interactions`
- Headers: `x-goog-api-key` (my key) and `Content-Type: application/json`
- Body: `{ "model": "...", "input": "Explain how AI works in a few words" }`

**The response:**
- Status line: `HTTP/1.1 200 OK` ✅
- Useful headers:
  - `Content-Type: application/json`: the body is JSON
  - `Server-Timing: dur=8046`: Google took about **8 seconds** to answer. This is why the call must be async.
  - `Date`: when the server answered
- Body:
  - The answer is deep inside: `steps` → the step with `type: "model_output"` → `content` → `text`
  - There is also a step with `type: "thought"`. It only has an encrypted `signature`, so I can't read the thinking.

**Token usage:**
| Field | Tokens |
|---|---|
| Input | 9 |
| Output (the answer) | 26 |
| **Thinking** | **465** |
| Total | 500 |

🧩 Puzzle solved: total (500) = input (9) + output (26) + **thinking (465)**. The model "thought" before answering, and that thinking uses tokens too. **93% of the tokens were thinking** for a one-sentence answer. Thinking tokens usually count toward cost and limits.

**Surprise:** I asked for `gemini-3.5-flash`, but the response says `"model": "gemini-3.6-flash"`. The server can use a different model than the one I named.
Lesson: **always log the model from the response**, not the one I asked for. (Project 1: "inspect what happened in any request".)

**Why can this happen?** The model name I send is a **request**, not a guarantee. The provider's server decides which model really answers. Common reasons:
- **Alias:** the name is a nickname that points to the newest version (like "latest").
- **Redirect:** an older model is being retired, so requests are moved to the newer one.
- **Routing:** when a model is busy, the server may send me to another one.

Google's docs did not say which reason applies here. My experiment: run the same request a few more times. If it is **always** 3.6 → alias or redirect. If it **changes** → routing under load.
- 🔁 Experiment result: (do later)

### Code review notes (`project-1/learning.ts`)
- No syntax errors. ✅
- Good: key comes from `.env` through `dotenv`, `.env` is in `.gitignore`, `"type": "module"` makes top-level `await` work.
- To do: print the **token usage** too. Hint: print the **whole response object** once and look for the usage part myself.
- Good to know: **`tsx` runs my code but does NOT check my types.** It just removes them. Type mistakes only show up with `npx tsc --noEmit`. Same lesson as "types disappear at runtime".

### Resources
- [ ] Gemini API quickstart (REST + JavaScript tabs): https://ai.google.dev/tutorials/text_quickstart
- [ ] MDN, HTTP overview: https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
- [ ] MDN, HTTP status codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- [ ] MDN, async/await: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises
- [ ] Search: `node --env-file flag`

---

<!-- Copy this for each new day -->
## Day N: <topic>
**Date:**

### The main idea of the day

### What I learned

### 🔁 Revisit

### Questions

### Resources
