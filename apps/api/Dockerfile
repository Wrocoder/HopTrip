FROM python:3.12-slim

WORKDIR /app
COPY pyproject.toml ./
COPY apps/api ./apps/api
COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN pip install --no-cache-dir .
RUN chmod +x /app/entrypoint.sh

WORKDIR /app/apps/api
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
