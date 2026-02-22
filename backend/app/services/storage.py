import uuid
from pathlib import Path

from app.core.config import settings


class StorageService:
    """File storage service. Uses local filesystem by default, S3 when configured."""

    def __init__(self):
        self._local_dir = Path("uploads")
        self._local_dir.mkdir(parents=True, exist_ok=True)
        self._s3_client = None

    def _get_s3_client(self):
        if self._s3_client is None:
            import boto3

            self._s3_client = boto3.client(
                "s3",
                endpoint_url=settings.S3_ENDPOINT_URL,
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
            )
        return self._s3_client

    @property
    def _use_s3(self) -> bool:
        return bool(settings.S3_ENDPOINT_URL) and settings.S3_ENDPOINT_URL != "http://localhost:9000"

    def _generate_key(self, org_id: uuid.UUID, filename: str) -> str:
        ext = Path(filename).suffix
        return f"{org_id}/{uuid.uuid4()}{ext}"

    async def upload(self, org_id: uuid.UUID, filename: str, data: bytes) -> str:
        key = self._generate_key(org_id, filename)

        if not self._use_s3:
            file_path = self._local_dir / key
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_bytes(data)
            return str(file_path)

        client = self._get_s3_client()
        client.put_object(Bucket=settings.S3_BUCKET_NAME, Key=key, Body=data)
        return f"s3://{settings.S3_BUCKET_NAME}/{key}"

    async def download(self, url: str) -> bytes:
        if not url.startswith("s3://"):
            return Path(url).read_bytes()

        client = self._get_s3_client()
        bucket, key = url.replace("s3://", "").split("/", 1)
        response = client.get_object(Bucket=bucket, Key=key)
        return response["Body"].read()

    async def delete(self, url: str):
        if not url.startswith("s3://"):
            path = Path(url)
            if path.exists():
                path.unlink()
            return

        client = self._get_s3_client()
        bucket, key = url.replace("s3://", "").split("/", 1)
        client.delete_object(Bucket=bucket, Key=key)


storage_service = StorageService()
