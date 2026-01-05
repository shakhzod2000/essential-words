# Essential Words - Language Learning Platform

A modern, Duolingo-style language learning platform built with Next.js and Django REST Framework. Features interactive lessons, vocabulary learning, grammar exercises, progress tracking, and AI-powered pronunciation using AWS Polly.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)

## ✨ Features

- 🌍 **Multi-language Support** - Learn any language from your native language
- 📚 **Structured Learning Path** - Units and lessons organized by CEFR levels (A1-C2)
- 🎯 **Interactive Lessons** - Multiple question types (translate, fill-in-blank, select word, listen & type, match pairs)
- 📖 **Vocabulary System** - Learn new words with translations and examples
- 📝 **Grammar Lessons** - Comprehensive grammar topics with explanations
- 🎤 **Audio Pronunciation** - AWS Polly text-to-speech with American/British accents
- 💡 **Hover Translations** - Instant word translations on hover
- ❤️ **Hearts System** - Duolingo-style hearts for mistakes
- ⭐ **Progress Tracking** - XP, streaks, stars, and achievements
- 📊 **Detailed Analytics** - Track words learned, grammar topics mastered, and lesson completion
- 🔐 **Secure Authentication** - Session-based auth with Django
- 📱 **Responsive Design** - Beautiful UI optimized for all devices

## 🎯 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with hooks
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3** - Utility-first styling
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icon library
- **Class Variance Authority** - Component variants

### Backend
- **Django 5.2** - Python web framework
- **Django REST Framework 3.16** - RESTful API
- **MySQL 8.0+** - Primary database
- **AWS S3** - Audio file storage
- **AWS Polly** - Text-to-speech synthesis
- **drf-yasg** - API documentation (Swagger/ReDoc)
- **django-cors-headers** - CORS support
- **django-filter** - API filtering
- **Pillow** - Image processing
- **boto3** - AWS SDK

## 📁 Project Structure

```
essential-words/
├── frontend/                  # Next.js application
│   ├── app/                  # App Router pages
│   │   ├── page.tsx         # Landing page
│   │   ├── from-lang/       # Native language selection
│   │   ├── target-lang/     # Target language selection
│   │   ├── learning-path/   # Main learning path with units & lessons
│   │   ├── lesson/          # Lesson page with questions
│   │   ├── lesson-result/   # Lesson completion page
│   │   └── quiz/            # Legacy quiz pages
│   ├── components/           # Reusable React components
│   │   ├── learning-path/   # Learning path components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatsPanel.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── LessonCircle.tsx
│   │   ├── lesson/          # Lesson components
│   │   │   └── HoverWord.tsx
│   │   ├── AuthModal.tsx
│   │   └── ui/              # Shadcn UI components
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                  # Utilities
│   │   ├── api.ts           # API client
│   │   └── utils.ts
│   └── public/              # Static assets
├── backend/                  # Django application
│   ├── config/              # Django settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── storage_backends.py
│   ├── lms/                 # Main learning management app
│   │   ├── models.py        # Database models
│   │   ├── serializers.py   # DRF serializers
│   │   ├── views.py         # API views
│   │   ├── admin.py         # Django admin configuration
│   │   ├── urls.py          # URL routing
│   │   └── management/      # Custom management commands
│   │       └── commands/
│   │           └── improve_lesson_1.py
│   ├── core/                # Core authentication app
│   └── manage.py
└── README.md
```

## 🗄️ Database Models

### Core Language Models

**Language**
- Stores available languages (English, German, Spanish, etc.)
- Fields: `name`, `code`, `flag_image`

**LanguagePair**
- Available language learning combinations (e.g., English → German)
- Fields: `from_lang`, `target_lang`, `is_active`

**Book**
- Learning books organized by language and CEFR level
- Fields: `title`, `language`, `description`, `cefr_level` (A1-C2)

**Unit**
- Units within books (typically 30 units per book)
- Fields: `book`, `lang_pair`, `number`, `title`, `description`, `is_published`

### Lesson & Content Models

**Lesson**
- Individual lessons within units
- Fields: `unit`, `lesson_type` (vocabulary/grammar/practice/story/review), `order`, `title`, `description`, `target_stars`, `grammar_topic`

**Vocabulary**
- Vocabulary words for each book
- Fields: `book`, `unit`, `word`, `part_of_speech`, `example_sentence`, `audio`

**VocabularyTranslation**
- Translations of vocabulary words
- Fields: `vocabulary`, `language`, `translation`, `example_translation`

**GrammarTopic**
- Grammar topics for target languages
- Fields: `language`, `title`, `cefr_level`, `description`

**GrammarLesson**
- Detailed grammar explanations
- Fields: `grammar_topic`, `language`, `content`, `examples`

### Question Models

**Question**
- Questions within lessons
- Fields: `lesson`, `question_type` (translate/fill_blank/select_word/listen_type/speak/match_pairs), `prompt`, `correct_answer`, `explanation`, `vocabulary`, `grammar_lesson`, `order`, `audio`, `image`

**QuestionOption**
- Multiple choice options for questions
- Fields: `question`, `text`, `order`

**TaskInstruction**
- Localized task instructions (e.g., "Translate this sentence:")
- Fields: `question_type`, `language`, `instruction_text`

### User Progress Models

**UserLanguagePair**
- User's progress in a language pair
- Fields: `user`, `lang_pair`, `total_xp`, `curr_streak`, `longest_streak`, `last_practice_date`, `total_words_learned`, `total_grammar_topics`, `level_progress_percent`

**UserLessonProgress**
- Progress for individual lessons
- Fields: `user`, `lesson`, `status` (locked/current/completed), `stars_earned`, `questions_completed`, `questions_correct`, `attempts`

**QuestionAttempt**
- Record of each question attempt
- Fields: `user`, `question`, `user_answer`, `is_correct`, `time_spent_sec`, `attempted_at`

**AssessmentResult**
- Results from level assessment tests
- Fields: `user`, `lang_pair`, `cefr_level`, `score`, `total_questions`, `completed_at`

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **MySQL 8.0+**
- **AWS Account** (for pronunciation features)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/essential-words.git
cd essential-words
```

### 2. Backend Setup

#### Create Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Create `.env` file in `backend/`:

```env
# Django Settings
SECRET_KEY=your-django-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=essential_words
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# AWS Credentials (for audio features)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=essential-words-audio
AWS_REGION=us-east-1

# CORS (for development)
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

#### Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE essential_words CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### Run Migrations

```bash
python manage.py migrate
python manage.py createsuperuser
```

#### Start Backend Server

```bash
python manage.py runserver
```

Backend available at:
- **API**: http://localhost:8000/api/
- **Admin**: http://localhost:8000/admin/
- **API Docs**: http://localhost:8000/api/docs/

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment

Create `.env.local` in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

#### Start Frontend Server

```bash
npm run dev
```

Frontend available at: **http://localhost:3000**

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/me/` - Get current user

### Languages & Language Pairs
- `GET /api/lms/languages/` - List all languages
- `GET /api/lms/language-pairs/` - List available language pairs
- `GET /api/lms/language-pairs/?from_lang={id}` - Filter by source language

### User Language Pairs
- `GET /api/lms/user-language-pairs/` - User's active language pairs
- `POST /api/lms/user-language-pairs/` - Start learning a new language pair
- `GET /api/lms/user-language-pairs/{id}/` - Get specific language pair progress

### Units & Lessons
- `GET /api/lms/units/?lang_pair={id}` - Get units for language pair
- `GET /api/lms/lessons/?unit={id}` - Get lessons for unit
- `GET /api/lms/lessons/{id}/` - Get lesson details
- `GET /api/lms/lessons/{id}/questions/` - Get lesson questions
- `POST /api/lms/lessons/{id}/complete/` - Complete lesson and update progress

### Questions
- `GET /api/lms/questions/?lesson={id}` - Get questions for lesson
- `POST /api/lms/questions/{id}/submit_answer/` - Submit answer

### Vocabulary & Grammar
- `GET /api/lms/vocabulary/?book={id}` - Get vocabulary for book
- `GET /api/lms/grammar-topics/?language={id}` - Get grammar topics

### Audio Pronunciation
- `GET /api/lms/pronunciation/?word={word}&unit={unit}&accent={american|british}` - Get word pronunciation

## 🎨 Key Features Explained

### Learning Path
- **Duolingo-style interface** with units arranged vertically
- **Lesson circles** show progress (locked/in-progress/completed)
- **Different lesson types**: Vocabulary (⭐), Grammar (📖), Practice (💪), Story (📚), Review (🏆)
- **Responsive sidebars** collapse to icons on smaller screens
- **Stats panel** tracks hearts, XP, streak

### Lesson Experience
- **Multiple question types**: Translate, fill-in-blank, select word, listen & type, match pairs
- **Hover translations**: Hover over any word to see translation in your native language
- **Hearts system**: Start with 5 hearts, lose one per wrong answer (skip doesn't cost hearts)
- **Instant feedback**: Client-side validation for immediate response
- **Session persistence**: Resume where you left off even after page refresh
- **3D Duolingo-style buttons**: Engaging UI with shadows and animations
- **Vocabulary highlighting**: New words highlighted in purple (#CE82FF)

### Progress Tracking
- **XP System**: Earn 10 XP per correct answer
- **Streaks**: Practice daily to build your streak
- **Stars**: Earn 1-5 stars based on accuracy (90%+ = 5 stars)
- **Auto-unlock**: Next lesson unlocks automatically on completion
- **Detailed stats**: Track words learned, grammar topics completed, total XP

## 🛠️ Development

### Backend Commands

```bash
# Make migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run custom management command
python manage.py improve_lesson_1

# Access Django shell
python manage.py shell

# Run tests
python manage.py test
```

### Frontend Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📊 Admin Dashboard

Access Django admin at `http://localhost:8000/admin/` to:
- Create/edit languages, books, units, lessons
- Add vocabulary words and translations
- Create questions and options
- View user progress and statistics
- Manage grammar topics and lessons
- Configure task instructions for different languages

## 🔧 Configuration

### Question Types

The platform supports 6 question types:

1. **translate** - Translate a sentence or phrase
2. **fill_blank** - Fill in the blank (use `____` or `{blank}` in prompt)
3. **select_word** - Select the correct word from options
4. **listen_type** - Listen to audio and type what you hear
5. **speak** - Speaking exercises (voice recording)
6. **match_pairs** - Match words/phrases with translations

### Lesson Types

- **vocabulary** - Introduce new words
- **grammar** - Grammar explanations and exercises
- **practice** - Mixed practice of learned content
- **story** - Reading comprehension stories
- **review** - Review previous units

### CEFR Levels

Lessons organized by Common European Framework of Reference:
- **A1** - Beginner
- **A2** - Elementary
- **B1** - Intermediate
- **B2** - Upper Intermediate
- **C1** - Advanced
- **C2** - Proficiency

## 🚀 Deployment

### Backend (Django)

```bash
# Install gunicorn
pip install gunicorn

# Collect static files
python manage.py collectstatic

# Run with gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

### Frontend (Next.js)

```bash
# Build for production
npm run build

# Start production server
npm start
```

For production deployment, consider:
- **Backend**: AWS EC2, Heroku, or DigitalOcean
- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Database**: AWS RDS, PlanetScale, or managed MySQL
- **Storage**: AWS S3 for audio files and images

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Inspired by [Duolingo](https://www.duolingo.com/)
- Icons by [Lucide](https://lucide.dev/)
- UI components from [Tailwind CSS](https://tailwindcss.com/)
- AWS Polly for text-to-speech

## 📧 Support

For questions or issues:
- Open an issue on GitHub
- Email: support@essentialwords.com

---

**Built with ❤️ for language learners worldwide**
