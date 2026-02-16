#RESTAPI endpoints

from fastapi import FastAPI

app = FastAPI()

taskList = []

@app.get('/')
def root():
    return {"hello": "World"}

@app.post('/addTask')
def addTask(task: str):
    taskList.append(task)
    return {"message": f"Task '{task}' added to the list."}

@app.get('/listTasks')
def listTasks():
    if not taskList:
        return {"message": "There are no tasks currently."}
    else:
        return {"tasks": taskList}