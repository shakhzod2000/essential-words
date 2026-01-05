# lms/views.py
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
import boto3
import botocore
from django.conf import settings

from .models import (
    Language, LanguagePair, Book, Unit, Lesson, 
    Vocabulary, Question, UserLanguagePair, UserLessonProgress,
    QuestionAttempt, GrammarTopic
)
from .serializers import (
    LanguageSerializer, LanguagePairSerializer, BookSerializer,
    UnitSerializer, LessonSerializer, VocabularySerializer,
    QuestionSerializer, UserSerializer, RegisterSerializer, 
    LoginSerializer, UserLanguagePairSerializer, UserLessonProgressSerializer
)


class LanguageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing languages"""
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    permission_classes = [permissions.AllowAny]


class LanguagePairViewSet(viewsets.ReadOnlyModelViewSet):
    """Available language pairs"""
    queryset = LanguagePair.objects.select_related('from_lang', 'target_lang').filter(is_active=True)
    serializer_class = LanguagePairSerializer
    permission_classes = [permissions.AllowAny]


class BookViewSet(viewsets.ReadOnlyModelViewSet):
    """Books filtered by language and CEFR level"""
    queryset = Book.objects.select_related('language').all()
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['language', 'cefr_level']


class UnitViewSet(viewsets.ReadOnlyModelViewSet):
    """Units with lessons"""
    queryset = Unit.objects.select_related('book', 'lang_pair').prefetch_related('lessons')
    serializer_class = UnitSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['book', 'lang_pair']
    
    @action(detail=True, methods=['get'])
    def vocabulary(self, request, pk=None):
        """Get all vocabulary for a unit"""
        unit = self.get_object()
        vocab = Vocabulary.objects.filter(unit=unit).prefetch_related('vocabulary_translations')
        serializer = VocabularySerializer(vocab, many=True, context={'request': request})
        return Response(serializer.data)


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    """Lessons with questions"""
    permission_classes = [permissions.AllowAny]
    serializer_class = LessonSerializer

    queryset = (
        Lesson.objects
        .select_related('unit', 'grammar_topic')
        .prefetch_related('questions')
    )
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['unit', 'lesson_type']

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get questions for this lesson"""
        lesson = self.get_object()
        questions = Question.objects.filter(lesson=lesson).prefetch_related('options', 'vocabulary', 'grammar_lesson')
        serializer = QuestionSerializer(questions, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete(self, request, pk=None):
        """Mark lesson as completed and update user stats"""
        from datetime import date
        lesson = self.get_object()

        stars_earned = request.data.get('stars_earned', 0)
        questions_completed = request.data.get('questions_completed', 0)
        questions_correct = request.data.get('questions_correct', 0)
        xp_earned = request.data.get('xp_earned', 0)

        # Create or update lesson progress
        progress, created = UserLessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            defaults={
                'status': 'completed',
                'stars_earned': stars_earned,
                'questions_completed': questions_completed,
                'questions_correct': questions_correct,
                'attempts': 1
            }
        )

        if not created:
            # Update existing progress
            progress.status = 'completed'
            progress.stars_earned = max(progress.stars_earned, stars_earned)  # Keep best score
            progress.questions_completed = questions_completed
            progress.questions_correct = questions_correct
            progress.attempts += 1
            progress.save()

        # Update user language pair stats
        user_lang_pair = UserLanguagePair.objects.get(
            user=request.user,
            lang_pair=lesson.unit.lang_pair
        )

        # Update XP
        user_lang_pair.total_xp += xp_earned

        # Update streak
        today = date.today()
        if user_lang_pair.last_practice_date:
            days_diff = (today - user_lang_pair.last_practice_date).days
            if days_diff == 0:
                # Already practiced today, don't change streak
                pass
            elif days_diff == 1:
                # Consecutive day, increment streak
                user_lang_pair.curr_streak += 1
                user_lang_pair.longest_streak = max(user_lang_pair.curr_streak, user_lang_pair.longest_streak)
            else:
                # Streak broken, reset to 1
                user_lang_pair.curr_streak = 1
        else:
            # First practice
            user_lang_pair.curr_streak = 1
            user_lang_pair.longest_streak = 1

        user_lang_pair.last_practice_date = today

        # Count total words learned (vocabulary lessons completed)
        if lesson.lesson_type == 'vocabulary' and created:
            user_lang_pair.total_words_learned += questions_correct

        # Count grammar topics
        if lesson.lesson_type == 'grammar' and lesson.grammar_topic and created:
            user_lang_pair.total_grammar_topics += 1

        user_lang_pair.save()

        # Unlock next lesson
        next_lesson = Lesson.objects.filter(
            unit=lesson.unit,
            order__gt=lesson.order
        ).order_by('order').first()

        if next_lesson:
            # Create progress entry for next lesson with 'current' status if it doesn't exist
            UserLessonProgress.objects.get_or_create(
                user=request.user,
                lesson=next_lesson,
                defaults={'status': 'current'}
            )

        return Response({
            'status': 'completed',
            'xp_earned': xp_earned,
            'streak': user_lang_pair.curr_streak,
            'total_xp': user_lang_pair.total_xp
        })


class VocabularyViewSet(viewsets.ReadOnlyModelViewSet):
    """Vocabulary words with translations"""
    queryset = Vocabulary.objects.select_related('unit').prefetch_related('vocabulary_translations')
    serializer_class = VocabularySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['unit']


class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """Questions for lessons"""
    queryset = Question.objects.select_related('lesson', 'vocabulary', 'grammar_lesson').prefetch_related('options')
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['lesson', 'question_type']
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit_answer(self, request, pk=None):
        """Submit answer for a question"""
        question = self.get_object()
        user_answer = request.data.get('answer', '').strip().lower()
        correct = question.correct_answer.strip().lower()
        
        is_correct = user_answer == correct
        time_spent = request.data.get('time_spent_sec')
        
        # Record attempt
        QuestionAttempt.objects.create(
            user=request.user,
            question=question,
            user_answer=user_answer,
            is_correct=is_correct,
            time_spent_sec=time_spent
        )
        
        return Response({
            'is_correct': is_correct,
            'correct_answer': question.correct_answer,
            'explanation': question.explanation
        })


class UserLanguagePairViewSet(viewsets.ModelViewSet):
    """User's language learning progress"""
    serializer_class = UserLanguagePairSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserLanguagePair.objects.filter(user=self.request.user).select_related('lang_pair__from_lang', 'lang_pair__target_lang', 'curr_unit').order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def learning_path(self, request, pk=None):
        """Get complete learning path with progress"""
        user_lang_pair = self.get_object()
        
        # Get all units for this language pair
        units = Unit.objects.filter(
            lang_pair=user_lang_pair.lang_pair,
            book__cefr_level=user_lang_pair.cefr_level
        ).prefetch_related('lessons')
        
        # Get user's lesson progress
        progress = UserLessonProgress.objects.filter(
            user=request.user,
            lesson__unit__in=units
        ).select_related('lesson')
        
        progress_map = {p.lesson_id: p for p in progress}
        
        data = []
        prev_lesson_completed = True
        is_first_lesson = True

        for unit in units:
            lessons_data = []
            # Ensure lessons are ordered correctly
            for lesson in unit.lessons.order_by('order'):
                lesson_progress = progress_map.get(lesson.id)
                
                status = 'locked'
                if lesson_progress:
                    status = lesson_progress.status
                elif is_first_lesson or prev_lesson_completed:
                    status = 'current'

                lessons_data.append({
                    'id': lesson.id,
                    'title': lesson.title,
                    'type': lesson.lesson_type,
                    'status': status,
                    'stars_earned': lesson_progress.stars_earned if lesson_progress else 0,
                    'total_stars': lesson.total_stars
                })
                
                prev_lesson_completed = (status == 'completed')
                is_first_lesson = False
            
            data.append({
                'unit_number': unit.number,
                'title': unit.title,
                'lessons': lessons_data
            })
        
        return Response(data)


class UserLessonProgressViewSet(viewsets.ModelViewSet):
    """Track user progress through lessons"""
    serializer_class = UserLessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserLessonProgress.objects.filter(user=self.request.user).select_related('lesson')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark lesson as completed and update stats"""
        progress = self.get_object()
        
        stars = request.data.get('stars_earned', 0)
        questions_completed = request.data.get('questions_completed', 0)
        questions_correct = request.data.get('questions_correct', 0)
        
        progress.status = 'completed'
        progress.stars_earned = stars
        progress.questions_completed = questions_completed
        progress.questions_correct = questions_correct
        progress.attempts += 1
        progress.save()
        
        # Update user language pair stats
        user_lang_pair = UserLanguagePair.objects.get(
            user=request.user,
            lang_pair=progress.lesson.unit.lang_pair
        )
        user_lang_pair.total_xp += progress.lesson.xp_reward
        user_lang_pair.save()
        
        return Response({'status': 'completed', 'xp_earned': progress.lesson.xp_reward})



#------------- Authentication Views ------------#
@swagger_auto_schema(
    method='post',
    operation_description='Register a new user',
    request_body=RegisterSerializer,
    responses={201: UserSerializer},
    tags=['auth']
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """Register a new user"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@swagger_auto_schema(
    method='post',
    operation_description='Login user with username and password',
    request_body=LoginSerializer,
    responses={200: UserSerializer},
    tags=['auth']
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Login user"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@swagger_auto_schema(
    method='post',
    operation_description='Logout current user',
    responses={200: 'Logout successful'},
    tags=['auth']
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Logout user"""
    logout(request)
    return Response({'message': 'Logout successful'})



@swagger_auto_schema(
    method='get',
    operation_description='Get current authenticated user',
    responses={200: UserSerializer},
    tags=['auth']
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user_view(request):
    """Get current user"""
    return Response(UserSerializer(request.user).data)



@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_pronunciation(request):
    """
    Get word pronunciation from S3 or generate with Polly
    Query params: word, unit_id, accent (american/british)
    """
    word = request.GET.get('word')
    unit_id = request.GET.get('unit_id')
    accent = request.GET.get('accent', 'american')
    
    if not word or not unit_id:
        return Response({'error': 'word and unit_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        unit = Unit.objects.get(id=unit_id)
    except Unit.DoesNotExist:
        return Response({'error': 'Unit not found'}, status=status.HTTP_404_NOT_FOUND)
    
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    folder = 'american' if accent == 'american' else 'british'
    key = f"audios/{folder}/{unit.book.title.replace(' ', '_')}/unit{unit.number}/{word.lower()}.mp3"
    
    s3 = boto3.client('s3', region_name=settings.AWS_REGION)
    polly = boto3.client('polly', region_name=settings.AWS_REGION)
    
    # Check if exists
    try:
        s3.head_object(Bucket=bucket_name, Key=key)
        url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': key}, ExpiresIn=3600)
        return Response({'url': url})
    except botocore.exceptions.ClientError:
        pass
    
    # Generate with Polly
    voice_id = 'Ruth' if accent == 'american' else 'Amy'
    try:
        response = polly.synthesize_speech(
            Text=word,
            OutputFormat='mp3',
            VoiceId=voice_id,
            Engine='neural'
        )
        
        audio = response['AudioStream'].read()
        s3.put_object(Bucket=bucket_name, Key=key, Body=audio, ContentType='audio/mpeg')
        
        url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': key}, ExpiresIn=3600)
        return Response({'url': url})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
