from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from django.db import connection
from .models import User


class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'email',
            'password',
            'role'
        ]
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def validate_email(self, value):
        value = value.lower().strip()

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def create(self, validated_data):
        validated_data['password'] = make_password(
            validated_data['password']
        )

        return User.objects.create(**validated_data)

class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):
        email = attrs['email'].lower().strip()
        password = attrs['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not check_password(password, user.password):
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        # The legacy users table stores account status in a separate `status`
        # column; it is intentionally not part of the unmanaged User model.
        # Enforce the status here so deactivated accounts cannot authenticate.
        with connection.cursor() as cursor:
            cursor.execute("SELECT status FROM users WHERE user_id = %s", [user.user_id])
            status_row = cursor.fetchone()
        account_status = (status_row[0] if status_row else None) or "Active"
        if str(account_status).strip().lower() not in ("active", "approved"):
            raise serializers.ValidationError(
                "This account has been deactivated. Please contact an administrator."
            )

        attrs['user'] = user

        return attrs