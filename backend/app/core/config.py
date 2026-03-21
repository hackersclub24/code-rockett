from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Code Rocket MVP"
    API_V1_STR: str = "/api"
    # To run locally, create a .env file or pass this env
    # Postgres async URL usually starts with postgresql+asyncpg://
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/coderockets"

    # Firebase configuration
    # Can be a path to service account json or set in environment variables
    FIREBASE_CREDENTIALS_PATH: str = "firebase-adminsdk.json"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
