FROM python:3.10.5-slim-buster
WORKDIR /pipeline

COPY requirements.txt requirements.txt
COPY config.py config.py
COPY put_data.py put_data.py
COPY conversion.json conversion.json
COPY scripts scripts

RUN apt-get update && apt-get install -y libpq-dev
RUN apt-get update && apt-get install -y gcc
RUN pip install --no-cache-dir -r requirements.txt

ENTRYPOINT ["python","put_data.py"]

CMD []