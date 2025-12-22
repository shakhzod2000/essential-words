# lms/views.py
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django_filters.rest_framework import DjangoFilterBackend
import boto3
import botocore
from django.conf import settings

from .models import Language, Book, Question, UserProgress, QuizAttempt
from .serializers import (
    LanguageSerializer, BookSerializer,
    QuestionSerializer, QuestionDetailSerializer,
    UserProgressSerializer, QuizAttemptSerializer,
    UserSerializer, RegisterSerializer, LoginSerializer
)


class LanguageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing languages"""
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    permission_classes = [permissions.AllowAny]


class BookViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing books"""
    queryset = Book.objects.select_related('language').all()
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['language']

    @action(detail=True, methods=['get'])
    def units(self):
        """Get all unique unit numbers for this book"""
        book = self.get_object()
        units = Question.objects.filter(book=book).values_list('unit', flat=True).distinct().order_by('unit')
        return Response({'units': list(units)})


class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for questions"""
    queryset = Question.objects.select_related('book__language').prefetch_related('options')
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['book', 'unit']
    ordering_fields = ['unit', 'order']
    ordering = ['unit', 'order']

    def get_serializer_class(self):
        # Hide correct answers when listing questions for quiz
        if self.request.query_params.get('for_quiz') == 'true':
            return QuestionDetailSerializer
        return QuestionSerializer

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def check_answer(self, request, pk=None):
        """Check if a single answer is correct"""
        question = self.get_object()
        user_answer = request.data.get('answer', '').strip()

        is_correct = user_answer == question.correct_answer.strip()

        return Response({
            'is_correct': is_correct,
            'correct_answer': question.correct_answer
        })

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request):
        """Submit quiz answers for a specific book and unit"""
        book_id = request.data.get('book')
        unit = request.data.get('unit')
        answers = request.data.get('answers', {})  # {question_id: selected_answer}

        if not book_id or not unit:
            return Response({'error': 'Book and unit are required'}, status=status.HTTP_400_BAD_REQUEST)

        if not answers:
            return Response({'error': 'No answers provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get all questions for this book and unit
        questions = Question.objects.filter(book=book, unit=unit).prefetch_related('options')
        total_questions = questions.count()
        correct_count = 0
        results = []

        for question in questions:
            user_answer = answers.get(str(question.id), '')
            is_correct = user_answer == question.correct_answer
            if is_correct:
                correct_count += 1

            results.append({
                'question_id': question.id,
                'question': question.text,
                'user_answer': user_answer,
                'correct_answer': question.correct_answer,
                'is_correct': is_correct,
                'explanation': question.explanation
            })

        # Save quiz attempt
        attempt = QuizAttempt.objects.create(
            user=request.user,
            book=book,
            unit=unit,
            score=correct_count,
            total_questions=total_questions
        )

        # Update user progress
        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            book=book,
            unit=unit,
            defaults={'score': correct_count}
        )
        if not created and correct_count > (progress.score or 0):
            progress.score = correct_count
            progress.save()

        return Response({
            'attempt_id': attempt.id,
            'score': correct_count,
            'total': total_questions,
            'percentage': attempt.percentage,
            'results': results
        })


class UserProgressViewSet(viewsets.ModelViewSet):
    """ViewSet for user progress tracking"""
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['book', 'unit', 'completed']

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user).select_related('book__language')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class QuizAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for quiz attempts history"""
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['book', 'unit']
    ordering_fields = ['started_at']
    ordering = ['-started_at']

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user).select_related('book__language')


# Authentication API Views
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


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Login user with session authentication"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Logout user"""
    logout(request)
    return Response({'message': 'Logout successful'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user_view(request):
    """Get current authenticated user"""
    return Response(UserSerializer(request.user).data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_pronunciation(request):
    """
    API endpoint to get pronunciation of a word from S3 or generate with Polly.
    Query parameters:
        - word: the word to pronounce
        - book: book identifier
        - unit: unit number
        - accent: "american" or "british" (default: american)
    """
    accent = request.GET.get('accent', 'american')
    book = request.GET.get('book')
    unit = request.GET.get('unit')
    word = request.GET.get('word')

    if not word or not book or not unit:
        return Response({'error': 'Missing required parameters: word, book, or unit'}, status=status.HTTP_400_BAD_REQUEST)

    # Defining s3 bucket name and folder structure
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    folder = 'american' if accent == 'american' else 'british'
    key = f"audios/{folder}/{book}/unit{unit}/{word.lower()}.mp3"

    # Initialize boto3 clients
    s3 = boto3.client('s3', region_name=settings.AWS_REGION)
    polly = boto3.client('polly', region_name=settings.AWS_REGION)

    # Check if file exists in s3
    try:
        s3.head_object(Bucket=bucket_name, Key=key)
        file_exists = True
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == '404':
            file_exists = False
        else:
            return Response({'error': 'Error checking S3'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if file_exists:
        # Generate presigned URL
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': key},
            ExpiresIn=3600
        )
        return Response({'url': url})
    else:
        # Generate voice with Polly
        voice_id = 'Ruth' if accent == 'american' else 'Amy'
        try:
            polly_response = polly.synthesize_speech(
                Text=word,
                OutputFormat='mp3',
                VoiceId=voice_id,
                Engine='neural',
            )
        except Exception as e:
            return Response({'error': 'Error calling Amazon Polly'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        audio_stream = polly_response.get('AudioStream')
        if audio_stream:
            try:
                s3.put_object(
                    Bucket=bucket_name,
                    Key=key,
                    Body=audio_stream.read(),
                    ContentType='audio/mpeg'
                )
            except Exception as e:
                return Response({'error': 'Error uploading to S3'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket_name, 'Key': key},
                ExpiresIn=3600
            )
            return Response({'url': url})
        else:
            return Response({'error': 'No audio generated'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
