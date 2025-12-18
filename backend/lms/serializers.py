# lms/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Language, Book, Question, Option, UserProgress, QuizAttempt

User = get_user_model()


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'name', 'code', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class BookSerializer(serializers.ModelSerializer):
    language_name = serializers.CharField(source='language.name', read_only=True)
    language_code = serializers.CharField(source='language.code', read_only=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'language', 'language_name', 'language_code', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'book', 'book_title', 'unit', 'order', 'text', 'correct_answer', 'explanation', 'options', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class QuestionDetailSerializer(serializers.ModelSerializer):
    """Serializer for quiz taking - hides correct answer and explanation"""
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'unit', 'order', 'text', 'options']


class UserProgressSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserProgress
        fields = ['id', 'user', 'username', 'book', 'book_title', 'unit', 'completed', 'score', 'completed_at', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']


class QuizAttemptSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'user', 'username', 'book', 'book_title', 'unit', 'score', 'total_questions', 'percentage', 'started_at', 'completed_at']
        read_only_fields = ['user', 'started_at']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, min_length=8)
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, label='Confirm Password')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
