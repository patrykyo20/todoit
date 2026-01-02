import { TaskList } from "@/components/layout";

export default async function LoggedIn() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <TaskList />
    </div>
  );
}
