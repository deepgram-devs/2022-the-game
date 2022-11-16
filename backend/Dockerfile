FROM node:19.1 AS node

WORKDIR /

COPY frontend ./
RUN npm install && npm run build

FROM python:3.10

WORKDIR /

COPY backend/requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY --from=node /build build

COPY backend/app app
ENTRYPOINT ["python", "-m", "app"]
