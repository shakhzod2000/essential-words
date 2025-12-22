# Backend API Design for Learning Management System

## Overview
This document outlines the backend API structure needed to support the new Duolingo-style learning flow.

## Database Models

### 1. Language Model (Update existing)
```python
class Language(models.Model):
    code = models.CharField(max_length=10, unique=True)  # en, de, uz
    name = models.CharField(max_length=100)  # English, German, Uzbek
    flag_image = models.ImageField(upload_to='flags/')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 2. UserLanguagePair Model (NEW)
```python
class UserLanguagePair(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='language_pairs')
    from_language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='source_pairs')
    to_language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='target_pairs')
    level = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ], default='beginner')
    assessment_score = models.IntegerField(null=True, blank=True)
    current_unit = models.ForeignKey('Unit', on_delete=models.SET_NULL, null=True, blank=True)
    started_from_scratch = models.BooleanField(default=True)
    total_xp = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    last_practice_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'from_language', 'to_language']
```

### 3. Unit Model (NEW)
```python
class Unit(models.Model):
    language_pair = models.ForeignKey('LanguagePair', on_delete=models.CASCADE, related_name='units')
    order = models.IntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty_level = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ])
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        unique_together = ['language_pair', 'order']
```

### 4. LanguagePair Model (NEW) - Represents available language combinations
```python
class LanguagePair(models.Model):
    from_language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='source_language_pairs')
    to_language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='target_language_pairs')
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['from_language', 'to_language']
```

### 5. Lesson Model (NEW)
```python
class Lesson(models.Model):
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='lessons')
    order = models.IntegerField()
    title = models.CharField(max_length=200)
    is_review = models.BooleanField(default=False)
    total_stars = models.IntegerField(default=3)  # 3 for regular, 5 for review
    xp_reward = models.IntegerField(default=10)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        unique_together = ['unit', 'order']
```

### 6. UserLessonProgress Model (NEW)
```python
class UserLessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[
        ('locked', 'Locked'),
        ('current', 'Current'),
        ('completed', 'Completed'),
    ], default='locked')
    stars_earned = models.IntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    attempts = models.IntegerField(default=0)

    class Meta:
        unique_together = ['user', 'lesson']
```

### 7. AssessmentQuestion Model (NEW)
```python
class AssessmentQuestion(models.Model):
    language_pair = models.ForeignKey(LanguagePair, on_delete=models.CASCADE)
    word = models.CharField(max_length=200)
    correct_answer = models.CharField(max_length=200)
    option_1 = models.CharField(max_length=200)
    option_2 = models.CharField(max_length=200)
    option_3 = models.CharField(max_length=200)
    difficulty = models.IntegerField(default=1)  # 1-4
    is_active = models.BooleanField(default=True)
```

### 8. AssessmentResult Model (NEW)
```python
class AssessmentResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessment_results')
    user_language_pair = models.ForeignKey(UserLanguagePair, on_delete=models.CASCADE)
    score = models.IntegerField()
    total_questions = models.IntegerField()
    determined_level = models.CharField(max_length=20)
    completed_at = models.DateTimeField(auto_now_add=True)
```

## API Endpoints

### Language Selection

#### GET /api/lms/languages/
Get all available languages
```json
Response: {
  "results": [
    {
      "id": 1,
      "code": "en",
      "name": "English",
      "flag_image": "/media/flags/usa.jpg"
    },
    {
      "id": 2,
      "code": "de",
      "name": "German",
      "flag_image": "/media/flags/germany.jpg"
    }
  ]
}
```

#### GET /api/lms/language-pairs/
Get available language pair combinations
```json
Response: {
  "results": [
    {
      "id": 1,
      "from_language": {"code": "uz", "name": "Uzbek"},
      "to_language": {"code": "en", "name": "English"},
      "is_active": true
    }
  ]
}
```

#### POST /api/lms/user-language-pairs/
Create a new language pair for user
```json
Request: {
  "from_language": "uz",
  "to_language": "en"
}

Response: {
  "id": 1,
  "from_language": {"code": "uz", "name": "Uzbek"},
  "to_language": {"code": "en", "name": "English"},
  "level": "beginner",
  "total_xp": 0,
  "current_streak": 0
}
```

### Assessment

#### GET /api/lms/assessment-questions/
Get assessment questions for level testing
```json
Query Params: {
  "from_language": "uz",
  "to_language": "en",
  "count": 8
}

Response: {
  "questions": [
    {
      "id": 1,
      "word": "Hello",
      "options": ["Hallo", "Tschüss", "Danke", "Bitte"],
      "difficulty": 1
    }
  ]
}
```

#### POST /api/lms/submit-assessment/
Submit assessment results
```json
Request: {
  "user_language_pair_id": 1,
  "answers": [
    {"question_id": 1, "selected_answer": "Hallo", "is_correct": true},
    {"question_id": 2, "selected_answer": "Danke", "is_correct": true}
  ],
  "score": 6,
  "total_questions": 8
}

Response: {
  "level": "intermediate",
  "score": 6,
  "percentage": 75,
  "unlocked_units": [1, 2]
}
```

### Learning Path

#### GET /api/lms/learning-path/
Get user's learning path with units and lessons
```json
Query Params: {
  "user_language_pair_id": 1
}

Response: {
  "units": [
    {
      "id": 1,
      "title": "Unit 1: Basics",
      "description": "Learn essential words and phrases",
      "lessons": [
        {
          "id": 1,
          "title": "Greetings",
          "status": "current",
          "stars_earned": 0,
          "total_stars": 3,
          "is_review": false
        },
        {
          "id": 2,
          "title": "Common Phrases",
          "status": "locked",
          "stars_earned": 0,
          "total_stars": 3,
          "is_review": false
        }
      ]
    }
  ],
  "user_stats": {
    "total_xp": 50,
    "current_streak": 3,
    "lessons_completed": 5
  }
}
```

#### POST /api/lms/start-lesson/
Start a lesson
```json
Request: {
  "lesson_id": 1
}

Response: {
  "lesson": {
    "id": 1,
    "title": "Greetings",
    "unit_title": "Unit 1: Basics"
  },
  "questions": [
    {
      "id": 101,
      "word": "Hello",
      "translation": "Hallo",
      "options": ["Hallo", "Tschüss", "Danke", "Bitte"],
      "audio_url": "/media/audio/hello_en.mp3"
    }
  ]
}
```

#### POST /api/lms/complete-lesson/
Complete a lesson and update progress
```json
Request: {
  "lesson_id": 1,
  "answers": [
    {"question_id": 101, "is_correct": true},
    {"question_id": 102, "is_correct": true}
  ],
  "score": 8,
  "total_questions": 10
}

Response: {
  "stars_earned": 2,
  "xp_earned": 10,
  "total_xp": 60,
  "next_lesson": {
    "id": 2,
    "title": "Common Phrases",
    "status": "current"
  },
  "streak_updated": true,
  "current_streak": 4
}
```

### User Progress

#### GET /api/lms/user-stats/
Get user statistics
```json
Response: {
  "total_xp": 150,
  "current_streak": 5,
  "longest_streak": 12,
  "lessons_completed": 15,
  "words_learned": 120,
  "daily_goal_progress": 3,
  "daily_goal": 5
}
```

## Implementation Steps

### Phase 1: Database Setup
1. Create new models: LanguagePair, UserLanguagePair, Unit, Lesson, UserLessonProgress, AssessmentQuestion, AssessmentResult
2. Run migrations
3. Create admin interfaces for all new models

### Phase 2: Seed Data
1. Populate Language model with en, de, uz
2. Create LanguagePair entries (uz→en, uz→de, en→de, etc.)
3. Create Units for each language pair
4. Create Lessons for each unit
5. Create AssessmentQuestions for level testing

### Phase 3: API Development
1. Create serializers for all models
2. Implement language-pairs viewset
3. Implement assessment-questions viewset
4. Implement learning-path viewset
5. Implement lesson progress tracking

### Phase 4: Integration
1. Update existing Question model to link with Lessons
2. Migrate existing Book/Unit data to new structure
3. Update quiz view to work with new lesson system

## Notes
- The existing Book and Question models can be gradually migrated to the new structure
- User authentication remains unchanged
- S3 storage for audio files will be used for pronunciation features
- Spaced repetition algorithm can be added later to UserLessonProgress
