
import { useForm, SubmitHandler } from "react-hook-form";
import { ZodSchema } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const useDynamicForm = <T extends Record<string, any>>(
  schema: ZodSchema<T>,
  onSubmit: SubmitHandler<T>
) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<T>({
    resolver: zodResolver(schema),
  });

  return {
    register,
    handleSubmit,
    watch,
    errors,
    onSubmitHandler: handleSubmit(onSubmit),
  };
};
