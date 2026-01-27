from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Any
from app.core.database import get_db
from app.db.models import Application
from app.schemas import schemas
from app.services.workflow import UnderwritingService

router = APIRouter()

@router.post("/applications/", response_model=schemas.ApplicationRead)
def create_application(application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    db_application = Application(**application.dict(), status="PENDING")
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@router.post("/applications/{application_id}/run-underwriting")
def run_underwriting(application_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Check existence
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Run synchronously for MVP/Demo purposes (or use background_tasks.add_task)
    service = UnderwritingService(db)
    results = service.run_underwriting(application_id)
    
    # Update status
    app.status = "COMPLETED"
    db.commit()
    
    return {"status": "Underwriting completed", "results": results}

@router.get("/applications/{application_id}", response_model=schemas.ApplicationRead)
def get_application(application_id: int, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app
