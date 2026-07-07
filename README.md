# 🏗️ ARCHITECT - AI-Powered Marketing Content Generator

<div align="center">

![ARCHITECT Banner](https://img.shields.io/badge/ARCHITECT-AI%20Marketing%20Suite-6366f1?style=for-the-badge&logo=sparkles&logoColor=white)

**A comprehensive AI-powered platform for generating brand-consistent marketing content, social media posts, campaign strategies, and visual advertisements.**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Stable Diffusion](https://img.shields.io/badge/Stable%20Diffusion-FF6F00?style=flat-square&logo=huggingface&logoColor=white)](https://huggingface.co/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Docker Setup (Production Ready)](#docker-setup-production-ready)
  - [Cloud Deployment (Render.com)](#️-cloud-deployment-rendercom)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**ARCHITECT** is a full-stack AI marketing platform designed to help businesses and marketers create professional, brand-consistent content at scale. The platform leverages cutting-edge AI models including Google Gemini for text generation and Stable Diffusion for image creation to deliver high-quality marketing assets.

### Key Capabilities

- 🎨 **Brand DNA Management** - Create and maintain consistent brand identities across all generated content
- 📱 **Multi-Platform Social Posts** - Generate optimized content for Instagram, Twitter/X, and Facebook
- 🖼️ **AI Image Generation** - Create stunning product visuals using text-to-image AI
- 📊 **Campaign Planning** - Get AI-powered marketing campaign strategies and recommendations
- 🎯 **Visual Ad Rendering** - Generate professional advertisement layouts with Playwright

---

## ✨ Features

### 🔷 Brand Alchemist
Create and manage comprehensive brand profiles that ensure all generated content maintains a consistent voice and style:
- **Brand Tone Selection**: Professional, Casual, Playful, Luxurious, Friendly, Bold, Minimalist, Inspirational
- **Core Values & Keywords**: Define what to include and avoid in content
- **Style Guidelines**: Custom instructions for content generation

### 🔷 Visual Architect
Generate stunning product images and marketing visuals:
- Text-to-image generation using Stable Diffusion XL
- Platform-optimized aspect ratios (Instagram, Facebook, Twitter)
- Brand-aligned visual styles
- Background removal and enhancement

### 🔷 Post Generator
Create platform-specific social media content:
- **Instagram**: Engaging, visual-focused posts with emojis and hashtags
- **Twitter/X**: Concise, punchy content within 280 characters
- **Facebook**: Informative, community-oriented posts
- Automatic hashtag generation
- Brand voice integration

### 🔷 Campaign Planner
AI-powered marketing campaign strategy generation:
- Channel recommendations (social media, email, SEO)
- Content strategy ideas
- Budget allocation suggestions
- KPI recommendations

### 🔷 Asset Renderer
Create professional advertisement assets:
- HTML-based ad layout generation via Gemini
- Playwright-powered screenshot rendering
- Multiple design styles (Minimalist Luxury, Bold, Modern, etc.)

### 🔷 Email Composer
Generate personalized marketing emails at scale:
- **10 Email Types**: Promotional, Welcome, Newsletter, Abandoned Cart, Re-engagement, Product Launch, Thank You, Seasonal, Feedback, Loyalty
- **7 Tone Options**: Friendly, Professional, Urgent, Casual, Luxurious, Playful, Inspirational
- **Deep Personalization**: Recipient name, interests, purchase history, engagement level
- **A/B Testing Ready**: Generate 1-5 email variants per request
- **Brand Voice Integration**: Maintain consistent messaging across all emails
- **HTML Preview**: Visualize emails before sendingemail

---

## 🏛️ Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                             Frontend (React)                                  │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌───────────────────┐│
│  │   Brand   │ │  Visual   │ │   Post    │ │  Email   │ │     Campaign      ││
│  │ Alchemist │ │ Architect │ │ Generator │ │ Composer │ │      Planner      ││
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └────┬─────┘ └────────┬──────────┘│
└────────┼─────────────┼─────────────┼────────────┼────────────────┼───────────┘
         │             │             │            │                │
         ▼             ▼             ▼            ▼                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           FastAPI Backend                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                          API Router                                     │  │
│  │  /brands  /generate-post  /generate-image  /generate-email  /generate-ad│  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                   │                                           │
│  ┌───────────────┐  ┌─────────────┴─────┐  ┌───────────────┐  ┌───────────┐  │
│  │ Brand Service │  │   Image Service   │  │ Email Service │  │ Ad Service│  │
│  └───────────────┘  └───────────────────┘  └───────────────┘  └───────────┘  │
│          │                  │                    │               │
│  ┌───────┴──────────────────┴────────────────────┴───────────┐  │
│  │                    SQLite Database                         │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                    │                     │
         ▼                    ▼                     ▼
┌─────────────┐    ┌──────────────────┐    ┌──────────────┐
│   Google    │    │   Hugging Face   │    │  Playwright  │
│   Gemini    │    │ (Stable Diffusion│    │  (Rendering) │
│   (LLM)     │    │      XL)         │    │              │
└─────────────┘    └──────────────────┘    └──────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance Python web framework |
| **SQLAlchemy** | ORM for database operations |
| **SQLite / PostgreSQL** | Relational databases for brand data storage |
| **Google Gemini** | LLM for content generation |
| **Hugging Face** | Stable Diffusion XL for image generation |
| **Playwright** | Browser automation for ad rendering |
| **Pydantic** | Data validation and serialization |
| **rembg** | AI-powered background removal |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | Modern UI library |
| **Vite** | Next-generation frontend tooling |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **Framer Motion** | Animation library |
| **React Router** | Client-side routing |
| **Lucide React** | Beautiful icon library |

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **npm** or **yarn**
- **Google AI API Key** (for Gemini)
- **Hugging Face API Token** (for Stable Diffusion)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Playwright browsers:**
   ```bash
   playwright install chromium
   ```

5. **Create a `.env` file in the backend directory:**
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   HF_API_TOKEN=your_huggingface_token_here
   ```

6. **Start the backend server:**
   ```bash
   cd app
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Docker Setup (Production Ready)

For production deployment or a quick, zero-config run, you can launch the complete application stack (Frontend, Backend, and PostgreSQL database) using Docker Compose.

1. **Prerequisites:**
   Make sure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

2. **Configure Environment Variables:**
   Copy the example environment file to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and add your Google Gemini API Key:
   ```env
   GOOGLE_API_KEY=your_actual_gemini_api_key
   ```

3. **Start the Application Stack:**
   Run the following command at the root of the project to build and start the containers:
   ```bash
   docker compose up --build -d
   ```

4. **Verify Running Containers:**
   Ensure all services are running:
   ```bash
   docker compose ps
   ```

5. **Access the Services:**
   - **Frontend (Application UI):** `http://localhost` (Port 80)
   - **Backend API Docs:** `http://localhost/docs` (Proxied via Nginx)
   - **Direct Backend API:** `http://localhost:8000`
   - **PostgreSQL Database:** `localhost:5432`

6. **Stop the Application:**
   To stop and remove the containers, networks, and volumes:
   ```bash
   docker compose down
   ```

### ☁️ Cloud Deployment (Render.com)

You can deploy the complete stack to Render.com using the included [render.yaml](file:///home/mohanned/Desktop/Projects/TuniHack/render.yaml) Blueprint:

1. Push your repository to GitHub or GitLab.
2. Go to the **Render Dashboard**, click **New +**, and select **Blueprint**.
3. Connect your repository. Render will automatically parse the `render.yaml` specification to provision the FastAPI container and React static site.
4. Input your `GOOGLE_API_KEY` (for Gemini API) on the Render setup page.
5. Render will automatically link the backend's address to the frontend during deployment.

---

## 📚 API Documentation

Once the backend is running, access the interactive API documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/brands` | GET | List all brand profiles |
| `/api/brands` | POST | Create a new brand profile |
| `/api/brands/{id}` | GET | Get a specific brand profile |
| `/api/brands/{id}` | PUT | Update a brand profile |
| `/api/brands/{id}` | DELETE | Delete a brand profile |
| `/api/generate-post` | POST | Generate social media posts |
| `/api/generate-image` | POST | Generate marketing images |
| `/api/generate-image/{platform}` | POST | Generate platform-optimized images |
| `/api/generate-email` | POST | Generate personalized marketing emails |
| `/api/generate-email/batch` | POST | Batch generate emails for multiple recipients |
| `/api/generate-email/preview` | POST | Get HTML preview of generated email |
| `/api/generate-ad` | POST | Generate visual advertisements |
| `/api/create-campaign` | POST | Generate campaign strategy |

---

## 📁 Project Structure

```
TuniHack/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── router.py           # API route definitions
│   │   ├── enums/
│   │   │   ├── target_audience.py  # Audience enum definitions
│   │   │   └── tone.py             # Brand tone enums
│   │   ├── models/
│   │   │   ├── brand.py            # Brand Pydantic models
│   │   │   ├── brand_db.py         # Brand SQLAlchemy model
│   │   │   ├── campaign.py         # Campaign model
│   │   │   ├── email.py            # Email generation models
│   │   │   ├── image.py            # Image generation models
│   │   │   └── product.py          # Product model
│   │   ├── prompts/
│   │   │   ├── ad_generation.py    # Ad generation prompts
│   │   │   ├── campaign_generation.py
│   │   │   ├── email_generation.py # Email prompt templates
│   │   │   ├── image_generation.py # Image prompt templates
│   │   │   └── post_generation.py  # Social post prompts
│   │   ├── scripts/
│   │   │   ├── campaign_generation.py
│   │   │   ├── post_generation.py  # Post generation logic
│   │   │   └── visual_gen.py       # Visual rendering helpers
│   │   ├── services/
│   │   │   ├── ad_service.py       # Ad generation service
│   │   │   ├── brand_service.py    # Brand CRUD operations
│   │   │   ├── email_service.py    # Email generation service
│   │   │   └── image_service.py    # Image generation service
│   │   ├── database.py             # Database configuration
│   │   └── main.py                 # FastAPI application entry
│   ├── data/
│   │   └── brands.json             # Brand data storage
│   ├── static/
│   │   └── generated_ads/          # Generated ad assets
│   ├── temp_ads/                   # Temporary ad files
│   └── requirements.txt            # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── AssetRenderer.jsx   # Ad asset rendering UI
│   │   │   ├── BrandAlchemist.jsx  # Brand management UI
│   │   │   ├── CampaignPlanner.jsx # Campaign planning UI
│   │   │   ├── EmailComposer.jsx   # Email generation UI
│   │   │   ├── ProductRenderer.jsx # Product visualization
│   │   │   └── VisualArchitect.jsx # Image generation UI
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main dashboard layout
│   │   │   ├── Hero.jsx            # Landing page
│   │   │   └── Post.jsx            # Post generator page
│   │   ├── App.jsx                 # Root component
│   │   └── main.jsx                # Application entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 📖 Usage Guide

### 1. Create a Brand Profile
Navigate to **Brand Alchemist** and define your brand's:
- Name and tagline
- Tone/voice (Professional, Casual, etc.)
- Core values
- Keywords to include/avoid
- Style guidelines

### 2. Generate Social Media Posts
Go to **Post Generator**:
1. Enter your product details (name, price, offer, description)
2. Select target audience
3. Optionally link to a brand profile
4. Click "Generate Posts" to create platform-optimized content

### 3. Create Marketing Images
Use **Visual Architect**:
1. Describe your product in detail
2. Select a visual style
3. Generate the base image
4. Render the final ad with text overlays

### 4. Plan a Marketing Campaign
Open **Campaign Planner**:
1. Define your campaign goal
2. Select target audience and industry
3. Set your budget
4. Get AI-powered recommendations

### 5. Generate Personalized Emails
Use **Email Composer** to create high-converting marketing emails:
1. Select email type (Promotional, Welcome, Abandoned Cart, etc.)
2. Choose the tone (Friendly, Professional, Urgent, etc.)
3. Enter product/offer details
4. Add recipient personalization (name, interests, purchase history)
5. Optionally link to a brand for consistent voice
6. Generate 1-5 email variants for A/B testing
7. Preview emails in HTML format before sending

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Required - Google Gemini API
GOOGLE_API_KEY=your_google_api_key

# Required - Hugging Face for Stable Diffusion
HF_API_TOKEN=your_huggingface_token
```

### Getting API Keys

1. **Google Gemini API**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to create an API key
2. **Hugging Face Token**: Create an account at [Hugging Face](https://huggingface.co/) and generate an access token from Settings > Access Tokens

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 style guide for Python code
- Use ESLint configuration for JavaScript/React code
- Write meaningful commit messages
- Add tests for new features when possible

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


<div align="center">

**Built with ❤️ for TuniHack**

[Report Bug](../../issues) · [Request Feature](../../issues)

</div>
