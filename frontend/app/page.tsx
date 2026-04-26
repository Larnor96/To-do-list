"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "open" | "done";

const storageKey = "local-todo-app.tasks";

type TodoDataApi = {
  loadTasks: () => Promise<Todo[]>;
  saveTasks: (tasks: Todo[]) => Promise<boolean>;
};

type TodoWindow = Window & {
  todoData?: TodoDataApi;
};

export default function Home() {
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadTasks() {
      try {
        const todoData = (window as TodoWindow).todoData;
        if (todoData) {
          const savedTasks = await todoData.loadTasks();
          if (isActive) {
            setTasks(savedTasks);
          }
          return;
        }

        const savedTasks = window.localStorage.getItem(storageKey);
        if (savedTasks && isActive) {
          setTasks(JSON.parse(savedTasks) as Todo[]);
        }
      } catch {
        if (isActive) {
          setTasks([]);
        }
      } finally {
        if (isActive) {
          setIsLoaded(true);
        }
      }
    }

    loadTasks();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const todoData = (window as TodoWindow).todoData;

    if (!isLoaded) {
      return;
    }

    if (todoData) {
      void todoData.saveTasks(tasks);
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(tasks));
    }
  }, [isLoaded, tasks]);

  const openTasks = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks],
  );
  const completedTasks = tasks.length - openTasks;
  const progress =
    tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  const visibleTasks = tasks.filter((task) => {
    if (filter === "open") {
      return !task.completed;
    }

    if (filter === "done") {
      return task.completed;
    }

    return true;
  });

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
    <main className="min-h-screen overflow-hidden bg-[#12151f] text-[#f7f3e8]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(118,184,168,0.24),transparent_32%),radial-gradient(circle_at_88%_10%,rgba(238,181,96,0.22),transparent_30%),linear-gradient(135deg,#12151f_0%,#202333_50%,#161922_100%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-5 py-6 sm:px-8">
        <header className="grid gap-5 border-b border-white/10 pb-6 md:grid-cols-[1fr_320px] md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7ed0be]">
              Local Todo
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Today&apos;s tasks
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#c8c8d2]">
              A focused offline workspace for the things you need to finish.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#f7f3e8]">Progress</span>
              <span className="text-[#7ed0be]">{progress}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-[#7ed0be] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-[#b8bac6]">
              <Stat label="Total" value={tasks.length} />
              <Stat label="Open" value={openTasks} />
              <Stat label="Done" value={completedTasks} />
            </div>
          </div>
        </header>

        <form
          className="grid gap-3 rounded-lg border border-white/10 bg-[#f8f4eb] p-3 shadow-2xl shadow-black/20 sm:grid-cols-[1fr_auto]"
          onSubmit={addTask}
        >
          <label className="sr-only" htmlFor="new-task">
            New task
          </label>
          <input
            id="new-task"
            className="min-h-12 min-w-0 rounded-md border border-[#ded4c3] bg-white px-4 text-base text-[#1f2933] outline-none transition placeholder:text-[#8f8d86] focus:border-[#2e7c70] focus:ring-4 focus:ring-[#2e7c70]/15"
            placeholder="Add a task"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
          />
          <button
            className="min-h-12 rounded-md bg-[#243c3b] px-6 text-sm font-bold text-white transition hover:bg-[#1c302f] focus:outline-none focus:ring-4 focus:ring-[#7ed0be]/30"
            type="submit"
          >
            Add task
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-md border border-white/10 bg-white/[0.07] p-1">
            <FilterButton
              active={filter === "all"}
              label="All"
              onClick={() => setFilter("all")}
            />
            <FilterButton
              active={filter === "open"}
              label="Open"
              onClick={() => setFilter("open")}
            />
            <FilterButton
              active={filter === "done"}
              label="Done"
              onClick={() => setFilter("done")}
            />
          </div>

          <button
            className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-[#f7f3e8] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={completedTasks === 0}
            onClick={clearCompleted}
            type="button"
          >
            Clear completed
          </button>
        </div>

        <section className="min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-white/[0.07] shadow-2xl shadow-black/20 backdrop-blur">
          {visibleTasks.length === 0 ? (
            <div className="grid min-h-72 place-items-center px-6 text-center">
              <div>
                <p className="text-lg font-bold text-white">No tasks here</p>
                <p className="mt-2 text-sm text-[#b8bac6]">
                  Add a new task or switch filters to see more.
                </p>
              </div>
            </div>
          ) : (
            <ul className="max-h-[48vh] divide-y divide-white/10 overflow-auto">
              {visibleTasks.map((task) => (
                <li
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 transition hover:bg-white/[0.06]"
                  key={task.id}
                >
                  <input
                    aria-label={`Mark ${task.text} as ${
                      task.completed ? "open" : "done"
                    }`}
                    checked={task.completed}
                    className="h-5 w-5 accent-[#7ed0be]"
                    onChange={() => toggleTask(task.id)}
                    type="checkbox"
                  />
                  <span
                    className={`min-w-0 break-words text-base ${
                      task.completed
                        ? "text-[#9296a8] line-through"
                        : "text-[#fbf8ef]"
                    }`}
                  >
                    {task.text}
                  </span>
                  <button
                    aria-label={`Delete ${task.text}`}
                    className="rounded-md px-3 py-2 text-sm font-bold text-[#f0a18d] opacity-80 transition hover:bg-[#f0a18d]/10 hover:opacity-100"
                    onClick={() => deleteTask(task.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-black/20 px-3 py-2">
      <div className="text-lg font-bold text-white">{value}</div>
      <div>{label}</div>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded px-4 py-2 text-sm font-bold transition ${
        active
          ? "bg-[#f8f4eb] text-[#192126]"
          : "text-[#d7d8df] hover:bg-white/10"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
