"use client";

import React from "react";
import SignIn from "./(auth)/sign-in";
import TodoApp from "./components/TodoApp";

export default function Home() {
  // Dummy array of todos to pass as the initial state
  const initialTodos = [
    { name: "Learn React", completed: true, cost: 50 }, // Include cost for initial todos
    { name: "Build Todo App", completed: false, cost: 0 },
  ];
  
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <SignIn />
    </section>
  );
}
