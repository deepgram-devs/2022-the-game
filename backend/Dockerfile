FROM python:3.10

WORKDIR /

COPY backend/requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY backend/app app
ENTRYPOINT ["python", "-m", "app"]
