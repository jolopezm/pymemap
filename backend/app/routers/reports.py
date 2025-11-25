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
    try:
        print(f"📥 Recibiendo reporte de usuario: {current_user.email}")
        print(f"📦 Datos del reporte: {report.model_dump(exclude={'id'})}")
        
        report.timestamp = datetime.utcnow().isoformat()
        report_dict = report.model_dump(by_alias=True)
        
        # Remover el _id si es None para que MongoDB genere uno nuevo
        if report_dict.get('_id') is None:
            report_dict.pop('_id', None)
        
        result = await db.reports.insert_one(report_dict)
        report.id = str(result.inserted_id)
        
        print(f"✅ Reporte creado con ID: {report.id}")
        return report
    except Exception as e:
        print(f"❌ Error al crear reporte: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear reporte: {str(e)}"
        )

@router.get("/", response_model=List[Report])
async def get_reports(skip: int = 0, limit: int = 100, current_user: TokenData = Depends(get_current_user)):
    reports_cursor = db.reports.find().skip(skip).limit(limit)
    reports = []
    async for report in reports_cursor:
        reports.append(Report(**report))
    return reports

@router.put("/{report_id}/update_state", response_model=Report)
async def update_report_state(report_id: str, new_state: str, current_user: TokenData = Depends(get_current_user)):
    try:
        
        result = await db.reports.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": {"state": new_state}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Reporte no encontrado")
        
        updated_report_data = await db.reports.find_one({"_id": ObjectId(report_id)})
        updated_report = Report(**updated_report_data)
        
        return updated_report
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar estado del reporte: {str(e)}"
        )