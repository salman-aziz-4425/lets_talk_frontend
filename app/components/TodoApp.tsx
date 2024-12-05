import React from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";

interface Todo {
  name: string;
  completed: boolean; // Add a completed status
  cost: number; // Add a cost field
  additionalInfo?: string; // Add an optional additional info field
}

interface FormData {
  todos: Todo[];
}

interface TodoAppProps {
  initialTodos: Todo[]; // Initial array of todos
}

const TodoApp: React.FC<TodoAppProps> = ({ initialTodos }) => {
  // Initialize React Hook Form
  const { register, handleSubmit, control, watch } = useForm<FormData>({
    defaultValues: {
      todos: initialTodos, // Use the initialTodos passed as props
    },
  });

  // useFieldArray for managing array of inputs
  const { fields, append, remove } = useFieldArray({
    control,
    name: "todos",
  });

  // Form submission handler
  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log("Submitted Todos:", data.todos);
  };

  return (
    <div>
      <h2>Todo List</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((item, index) => {
          // Watch the cost value dynamically
          const costValue = watch(`todos.${index}.cost`);

          return (
            <div key={item.id} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Input for todo name */}
                <input
                  {...register(`todos.${index}.name` as const)}
                  defaultValue={item.name}
                  placeholder="Enter todo item"
                  style={{ flex: 1 }}
                />

                {/* Toggle for completed status */}
                <label>
                  <input
                    type="checkbox"
                    {...register(`todos.${index}.completed` as const)}
                    defaultChecked={item.completed}
                  />
                  Completed
                </label>

                {/* Input for cost */}
                <input
                  type="number"
                  {...register(`todos.${index}.cost` as const)}
                  placeholder="Enter cost"
                  defaultValue={item.cost}
                  style={{ flex: 1 }}
                />

                {/* Conditionally render additional info if cost > 0 */}
                {costValue > 0 && (
                  <input
                    {...register(`todos.${index}.additionalInfo` as const)}
                    placeholder="Enter additional info"
                    style={{ flex: 1 }}
                  />
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  style={{ marginLeft: "10px" }}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        {/* Add a new todo */}
        <button
          type="button"
          onClick={() => append({ name: "", completed: false, cost: 0 })}
          style={{ marginTop: "10px" }}
        >
          Add Todo
        </button>

        {/* Submit button */}
        <button type="submit" style={{ marginTop: "10px" }}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default TodoApp;
