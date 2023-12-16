FROM python:latest
WORKDIR /pipeline

COPY requirements.txt requirements.txt
COPY config.py config.py
COPY put_data.py put_data.py
COPY conversion.json conversion.json
COPY scripts scripts

RUN pip install --no-cache-dir -r requirements.txt

ENTRYPOINT ["python","put_data.py"]

CMD []