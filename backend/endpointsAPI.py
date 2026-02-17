#RESTAPI endpoints

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

class Task(BaseModel):
    text: str
    is_done: bool = False

app = FastAPI()

taskList = []

@app.get('/')
def root():
    return {"hello": "World"}

@app.post('/addTask')
def addTask(task: str):
    taskList.append(task)
    return {"message": f"Task '{task}' added to the list."}

@app.get('/listTasks', response_model=list[Task])
def listTasks():
    return taskList
    
@app.delete('/deleteTask/{taskIndex}')
def deleteTask(taskIndex: int):
    if 0 <= taskIndex < len(taskList):
        deleted_task = taskList.pop(taskIndex)
        return {"message": f"Task '{deleted_task}' deleted from the list."}
    else:
        raise HTTPException(status_code=404, detail="Task index is out of bounds.")