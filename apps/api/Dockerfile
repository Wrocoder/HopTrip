FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml requirements.lock ./
RUN pip install --no-cache-dir -r requirements.lock
COPY apps/api ./apps/api
COPY apps/api/entrypoint.sh ./entrypoint.sh
# Dependencies are installed from the lockfile; run the copied source directly.
# Avoid fetching an unpinned build backend just to install this local package.
ENV PYTHONPATH=/app/apps/api
RUN chmod +x /app/entrypoint.sh
WORKDIR /app/apps/api
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--no-access-log", "--no-proxy-headers"]
