from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Code Rocket MVP"
    API_V1_STR: str = "/api"
    # To run locally, create a .env file or pass this env
    # Postgres async URL usually starts with postgresql+asyncpg://
    DATABASE_URL: str = "postgresql+asyncpg://neondb_owner:npg_fEj3bG5zyDPx@ep-silent-math-ansiie7t-pooler.c-6.us-east-1.aws.neon.tech/neondb?ssl=require"

    # Firebase configuration
    # Can be a path to service account json or set in environment variables
    FIREBASE_CREDENTIALS_PATH: str = "firebase-adminsdk.json"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
