from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "CodingRocket"
    app_env: str = "development"
    debug: bool = True

    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/coding_rocket"

    secret_key: str = "change-me"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    algorithm: str = "HS256"

    allowed_origins: str = "http://localhost:3000"

    resend_api_key: str = ""
    email_from: str = "noreply@localhost"
    admin_email: str = ""

    admin_email_seed: str = ""
    admin_password_seed: str = ""

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
