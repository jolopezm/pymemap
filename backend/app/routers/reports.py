from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timedelta
from typing import List
from bson import ObjectId
import random
from ..db import db
from ..models.reports import (
    Report
)
from ..auth import get_current_user
from ..models.token import TokenData

router = APIRouter()

@router.post("/", response_model=Report)
async def create_report(report: Report, current_user: TokenData = Depends(get_current_user)):
    report.timestamp = datetime.utcnow().isoformat()
    report_dict = report.model_dump(by_alias=True)
    result = await db.reports.insert_one(report_dict)
    report.id = str(result.inserted_id)
    return report

@router.get("/", response_model=List[Report])
async def get_reports(skip: int = 0, limit: int = 100, current_user: TokenData = Depends(get_current_user)):
    reports_cursor = db.reports.find().skip(skip).limit(limit)
    reports = []
    async for report in reports_cursor:
        reports.append(Report(**report))
    return reports