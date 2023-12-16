FROM python:latest
WORKDIR /pipeline

COPY requirements.txt requirements.txt
COPY config.py config.py
COPY data_script.py data_script.py

RUN pip install --no-cache-dir -r requirements.txt

ENTRYPOINT ["python","data_script.py"]

CMD []