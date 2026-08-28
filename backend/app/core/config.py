from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "E-CAKRA"
    APP_ENV: str = "development"

    # Database
    DATABASE_URL: str = "postgresql://ecakra:ecakra_secret@db:5432/ecakra"

    # Auth
    SECRET_KEY: str = "change-me-to-a-long-random-secret-key"
    ALGORITHM: str = "HS256"

    # Digunakan hanya sebagai fallback; override via env var di production disarankan.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Zoom
    ZOOM_ACCOUNT_ID: str = ""
    ZOOM_CLIENT_ID: str = ""
    ZOOM_CLIENT_SECRET: str = ""
    ZOOM_WEBHOOK_SECRET_TOKEN: str = ""
    ZOOM_HOST_USER_ID: str = "me"

    # CORS — disimpan sebagai string, di-parse manual
    CORS_ORIGINS: str = "http://localhost,http://localhost:80,http://localhost:3000"

    def get_cors_origins(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    def validate_production(self) -> None:
        if self.APP_ENV == "production":
            self.ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Waktu kadaluwarsa token JWT lebih pendek di production
            if not self.SECRET_KEY or self.SECRET_KEY == "change-me-to-a-long-random-secret-key":
                raise ValueError("SECRET_KEY production tidak valid. Wajib diubah!")
            if not self.ZOOM_WEBHOOK_SECRET_TOKEN:
                raise ValueError("ZOOM_WEBHOOK_SECRET_TOKEN wajib diisi di environment production.")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
settings.validate_production()
