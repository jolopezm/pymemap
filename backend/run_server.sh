#!/bin/bash
cd /home/nostradei/dev/pymemap/backend
export PYTHONPATH=/home/nostradei/dev/pymemap/backend/venv/lib/python3.10/site-packages:$PYTHONPATH
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000