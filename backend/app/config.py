from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RAKSHKAVACH"
    API_V1_STR: str = "/api/v1"
    SUPABASE_URL: str = "https://your-project.supabase.co"
    SUPABASE_ANON_KEY: str = "your-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "server-only-service-role-key"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    ISOLATION_FOREST_CONTAMINATION: float = 0.1

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
