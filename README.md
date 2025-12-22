# Essential Words - Language Learning Platform

A modern language learning platform built with Next.js and Django REST Framework, similar to Duolingo.

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React** - UI library

### Backend
- **Django 5.2** - Python web framework
- **Django REST Framework** - API framework
- **MySQL** - Database
- **AWS S3 & Polly** - Audio storage and text-to-speech
- **Session-based Authentication** - Secure cookie-based auth

## Project Structure

```
essential-words/
├── frontend/          # Next.js application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   └── lib/          # Utilities and API client
├── backend/          # Django application
│   ├── config/       # Django settings
│   ├── lms/          # Main app (models, views, serializers)
│   └── migrate_data.py  # Data migration script
└── README.md
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- pip and npm

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd essential-words
```

### 2. Backend Setup

#### Create Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database
DB_NAME=essential_words
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# AWS Credentials (for pronunciation feature)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=us-east-1
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

If you have existing data in old table structure:

```bash
# Apply new migrations (creates new tables alongside old ones)
python manage.py migrate

# Run data migration script to transfer old data to new structure
python migrate_data.py

# Verify data in Django admin, then drop old tables if everything looks good
```

If this is a fresh installation:

```bash
# Simply run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

#### Start Development Server

```bash
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`
- API: `http://localhost:8000/api/`
- API Docs: `http://localhost:8000/api/docs/`
- Admin: `http://localhost:8000/admin/`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

#### Start Development Server

```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET /api/auth/me/` - Get current user

### Languages
- `GET /api/languages/` - List all languages

### Books
- `GET /api/books/` - List all books
- `GET /api/books/{id}/` - Get book details
- `GET /api/books/?language={id}` - Filter books by language

### Units
- `GET /api/units/` - List all units
- `GET /api/units/{id}/` - Get unit details
- `GET /api/units/?book={id}` - Filter units by book

### Quizzes
- `GET /api/quizzes/` - List all quizzes
- `GET /api/quizzes/{id}/` - Get quiz with questions
- `POST /api/quizzes/{id}/submit/` - Submit quiz answers
- `GET /api/quizzes/?unit={id}` - Filter quizzes by unit

### Progress Tracking
- `GET /api/progress/` - Get user's progress
- `POST /api/progress/` - Create/update progress
- `GET /api/attempts/` - Get user's quiz attempts

### Pronunciation
- `GET /api/pronunciation/?word={word}&book={book}&unit={unit}&accent={accent}` - Get word pronunciation

## Database Models

### Core Models

**Language**
- `name` - Language name (e.g., "English")
- `code` - Language code (e.g., "en")

**Book**
- `title` - Book title
- `language` - Foreign key to Language
- `description` - Book description

**Unit**
- `book` - Foreign key to Book
- `number` - Unit number
- `title` - Unit title
- `description` - Unit description

**Quiz**
- `unit` - Foreign key to Unit
- `title` - Quiz title
- `description` - Quiz description

**Question**
- `quiz` - Foreign key to Quiz
- `order` - Question order
- `text` - Question text
- `correct_answer` - Correct answer
- `explanation` - Answer explanation

**Option**
- `question` - Foreign key to Question
- `text` - Option text
- `order` - Option order

### Progress Tracking Models

**UserProgress**
- `user` - Foreign key to User
- `unit` - Foreign key to Unit
- `completed` - Boolean
- `score` - User's score
- `completed_at` - Completion timestamp

**QuizAttempt**
- `user` - Foreign key to User
- `quiz` - Foreign key to Quiz
- `score` - Score achieved
- `total_questions` - Total questions
- `started_at` - Start timestamp
- `completed_at` - Completion timestamp

## Development

### Backend Development

```bash
# Activate virtual environment
source .venv/bin/activate

# Make migrations after model changes
python backend/manage.py makemigrations

# Apply migrations
python backend/manage.py migrate

# Create superuser
python backend/manage.py createsuperuser

# Run tests
python backend/manage.py test

# Access Django shell
python backend/manage.py shell
```

### Frontend Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Migrating from Old Structure

If you have an existing database with the old table structure (`quizzes`, `questions`, `options`), follow these steps:

1. **Backup your database** (important!)
   ```bash
   mysqldump -u root -p essential_words > backup.sql
   ```

2. **Apply new migrations**
   ```bash
   python backend/manage.py migrate
   ```

3. **Run the data migration script**
   ```bash
   python backend/migrate_data.py
   ```

4. **Verify the data** in Django admin at `http://localhost:8000/admin/`

5. **Drop old tables** (after verification)
   ```sql
   DROP TABLE options;
   DROP TABLE questions;
   DROP TABLE quizzes;
   ```

## Features

- ✅ User authentication (register, login, logout)
- ✅ Multiple languages support
- ✅ Book-based learning structure
- ✅ Unit organization
- ✅ Interactive quizzes
- ✅ Progress tracking
- ✅ Quiz attempt history
- ✅ Audio pronunciation (AWS Polly)
- ✅ RESTful API
- ✅ API documentation (Swagger/ReDoc)
- ✅ Admin dashboard
- ✅ Responsive design (Tailwind CSS)

## Future Enhancements

- [ ] Spaced repetition system
- [ ] Gamification (streaks, achievements)
- [ ] Social features (leaderboards, friends)
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics
- [ ] AI-powered personalization
- [ ] Speaking exercises
- [ ] Writing exercises
- [ ] Real-time multiplayer quizzes

## License

MIT

## Contributing

Contributions are welcome! Please read the contributing guidelines before getting started.

## Support

For issues and questions, please open an issue on GitHub.
