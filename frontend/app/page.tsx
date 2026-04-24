"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

const storageKey = "local-todo-app.tasks";

export default function Home() {
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedTasks = window.localStorage.getItem(storageKey);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks) as Todo[]);
      }
    } catch {
      setTasks([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(tasks));
    }
  }, [isLoaded, tasks]);

  const openTasks = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks],
  );

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = newTask.trim();

    if (!text) {
      return;
    }

    setTasks((currentTasks) => [
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: Date.now(),
      },
      ...currentTasks,
    ]);
    setNewTask("");
  }

  function toggleTask(id: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id),
    );
  }

  function clearCompleted() {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => !task.completed),
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f4ee] text-[#1f2933]">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8">
        <header className="mb-8 flex flex-col gap-3 border-b border-[#d9d2c3] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5f6f52]">
              Local Todo
            </p>
            <h1 className="mt-2 text-4xl font-bold text-[#16212d]">
              Today&apos;s tasks
            </h1>
          </div>
          <p className="text-sm text-[#5f6b77]">
            {openTasks === 0
              ? "No open tasks"
              : `${openTasks} ${openTasks === 1 ? "open task" : "open tasks"}`}
          </p>
        </header>

        <form className="flex gap-3" onSubmit={addTask}>
          <label className="sr-only" htmlFor="new-task">
            New task
          </label>
          <input
            id="new-task"
            className="min-w-0 flex-1 rounded-md border border-[#cfc6b4] bg-white px-4 py-3 text-base shadow-sm outline-none transition focus:border-[#426b69] focus:ring-4 focus:ring-[#426b69]/15"
            placeholder="Add a task"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
          />
          <button
            className="rounded-md bg-[#273f3f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f3333] focus:outline-none focus:ring-4 focus:ring-[#426b69]/25"
            type="submit"
          >
            Add
          </button>
        </form>

        <div className="mt-6 flex-1">
          {tasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-[#cfc6b4] bg-white/55 px-5 py-12 text-center text-[#687481]">
              No tasks yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  className="flex items-center gap-3 rounded-md border border-[#ded7ca] bg-white px-4 py-3 shadow-sm"
                  key={task.id}
                >
                  <input
                    aria-label={`Mark ${task.text} som ${
                      task.completed ? "ikke ferdig" : "ferdig"
                    }`}
                    checked={task.completed}
                    className="h-5 w-5 shrink-0 accent-[#426b69]"
                    onChange={() => toggleTask(task.id)}
                    type="checkbox"
                  />
                  <span
                    className={`min-w-0 flex-1 break-words text-base ${
                      task.completed
                        ? "text-[#7b858f] line-through"
                        : "text-[#1f2933]"
                    }`}
                  >
                    {task.text}
                  </span>
                  <button
                    aria-label={`Delete ${task.text}`}
                    className="rounded-md px-3 py-2 text-sm font-semibold text-[#8a3b2d] transition hover:bg-[#f7e8e3] focus:outline-none focus:ring-4 focus:ring-[#8a3b2d]/15"
                    onClick={() => deleteTask(task.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {tasks.some((task) => task.completed) && (
          <footer className="mt-6 flex justify-end">
            <button
              className="rounded-md border border-[#cfc6b4] bg-white px-4 py-2 text-sm font-semibold text-[#39434d] transition hover:bg-[#f1eee7] focus:outline-none focus:ring-4 focus:ring-[#426b69]/15"
              onClick={clearCompleted}
              type="button"
            >
              Clear completed
            </button>
          </footer>
        )}
      </section>
    </main>
  );
}

