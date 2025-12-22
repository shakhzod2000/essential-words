#!/usr/bin/env python
"""Test S3 connection and credentials"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import boto3
from django.conf import settings
from botocore.exceptions import ClientError

def test_s3_connection():
    print("Testing S3 connection...")
    print(f"Bucket: {settings.AWS_STORAGE_BUCKET_NAME}")
    print(f"Region: {settings.AWS_REGION}")
    print(f"Access Key: {settings.AWS_ACCESS_KEY_ID[:10]}...")

    try:
        # Create S3 client
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )

        # Test: List objects in bucket
        print("\nTesting bucket access...")
        response = s3.list_objects_v2(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            MaxKeys=5
        )

        print("✅ SUCCESS! S3 connection works!")
        print(f"Bucket contains {response.get('KeyCount', 0)} objects (showing max 5)")

        if 'Contents' in response:
            print("\nFirst few objects:")
            for obj in response['Contents'][:5]:
                print(f"  - {obj['Key']}")

        return True

    except ClientError as e:
        error_code = e.response['Error']['Code']
        print(f"\n❌ ERROR: {error_code}")
        print(f"Message: {e.response['Error']['Message']}")

        if error_code == 'InvalidAccessKeyId':
            print("\n→ Your AWS_ACCESS_KEY_ID is invalid")
        elif error_code == 'SignatureDoesNotMatch':
            print("\n→ Your AWS_SECRET_ACCESS_KEY is invalid")
        elif error_code == 'NoSuchBucket':
            print(f"\n→ Bucket '{settings.AWS_STORAGE_BUCKET_NAME}' does not exist")
        elif error_code == 'AccessDenied':
            print("\n→ Your credentials don't have permission to access this bucket")

        return False
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {type(e).__name__}: {str(e)}")
        return False

if __name__ == '__main__':
    test_s3_connection()
