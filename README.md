# NovaFYP Advisor
Intelligent Final Year Project Discovery & Recommendation Platform using NLP and RAG.

NovaFYP Advisor helps students discover, plan, and validate final year project ideas using insights from a large archive of past FYPs. The platform combines semantic search, recommendations, and a RAG-powered chatbot for guided decision-making.

## Planning Phase (MVP Focus)
This project centers on a structured planning phase that guides teams from idea to execution:

1. **MVP Planning**
	- Problem: students waste time searching for viable FYP ideas in scattered sources.
	- Core solution: a single portal that searches archived FYPs, recommends similar ideas, and explains trade-offs via chatbot.
	- Target users: final-year CS/SE students and FYP supervisors; pain points are idea discovery, validation, and scoping.
	- Success metric: user can shortlist 3 viable ideas within 10 minutes.
	- MVP boundaries: must-have (search, recommendations, chatbot, basic filters), should-have (bookmarks, profile), out-of-scope (full project management, team collaboration).
2. **Technical Architecture**
	- Stack: Next.js + Tailwind (frontend), FastAPI/Flask (backend), Supabase auth, vector store for embeddings.
	- Data flow: CSV ingestion -> embedding + indexing -> retrieval APIs -> frontend pages + chatbot.
	- Core services: semantic search, similar-project recommendations, RAG chatbot, trends analytics.
	- Deployment: frontend on Vercel, backend on Render/Fly/EC2; env vars for API base URL, Supabase keys, and model settings.
3. **User Stories**
	- As a student, I can search by domain/tech and see results as cards with title, abstract, and links.
	- As a student, I can ask the chatbot for ideas and get 3 suggestions plus related projects.
	- As a student, I can bookmark ideas and view them later in my profile.
	- As a supervisor, I can review trends and see popular domains and tech stacks.
4. **Design System**
	- Typography: display heading + readable body font; consistent weights for hierarchy.
	- Color: brand primary, accent, neutral text, and status colors for chips.
	- Spacing: 4/8/16/24/32 scale; consistent card padding and section gaps.
	- Components: project cards, filter chips, chatbot panel, dashboard tiles, empty/loading states.

These steps are represented in the landing page so users understand the workflow immediately.

## Access Rules (Auth + UX)
- **Discover** and **Dashboard** are open without login.
- **Chatbot** and **Bookmarks/Profile** require authentication.
- Supabase auth is validated via `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

If Supabase keys are missing, the app falls back to mock auth for the UX prototype.

## Dataset
Kaggle source used for the dashboard reference:
https://www.kaggle.com/datasets/nabeelqureshitiii/past-fyp-data

## Repo Structure
- `frontend/` - Next.js UI
- `backend/` - Recommendation system API (cloned from https://github.com/mohammedabdullahcs/fyp_recommendation_system.git)

## API Guidelines (Backend Contract)
Base URL example: `http://yourserver.com/api/v1`

### Endpoints
- `GET /projects` - List or filter projects
- `POST /recommendations` - Similar projects for a selected title
- `POST /search` - Semantic search by natural language
- `POST /chatbot` - Conversational RAG chatbot
- `GET /trends` - Analytics data for dashboards
- `POST /personalized_recommendations` - Profile-based recommendations

### Request/Response Snapshot
**GET /projects**
- Query: `domain`, `technology`, `year`, `difficulty`, `hardware`

**POST /search**
```json
{
  "query": "AI project using Python without hardware",
  "top_k": 5
}
```

**POST /chatbot**
```json
{
  "user_message": "Suggest me 3 trending AI projects in Python",
  "conversation_history": [
	 { "role": "user", "message": "I want AI projects" },
	 { "role": "bot", "message": "Do you have any preferred technologies?" }
  ],
  "top_k": 5
}
```

### Frontend Notes
- Display results as project cards (title, abstract, domain, tech, uniqueness, source URL).
- Filters call `GET /projects` with query params.
- Chatbot uses `POST /chatbot` and shows `bot_response` + recommended projects.
- Trends dashboard uses `GET /trends` for charts.
- Similar projects use `POST /recommendations`.
- Personalized cards use `POST /personalized_recommendations`.
