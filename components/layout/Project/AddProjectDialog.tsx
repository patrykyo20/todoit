"use client";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Calendar as CalendarComponent } from "@/components/ui/Calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function AddProjectDialog() {
  return (
    <Dialog>
      <DialogTrigger
        id="closeDialog"
        className="cursor-pointer hover:bg-primary/10 rounded-md p-1 transition-colors"
      >
        <PlusIcon
          className="h-5 w-5 hover:text-primary transition-colors"
          aria-label="Add a Project"
        />
      </DialogTrigger>
      <AddProjectDialogContent />
    </Dialog>
  );
}

interface ProjectFormData {
  name: string;
  status?: "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
  startDate?: Date;
  endDate?: Date;
  description?: string;
  color?: string;
}

function AddProjectDialogContent() {
  const form = useForm<ProjectFormData>({
    defaultValues: {
      name: "",
      status: "planning",
      description: "",
      color: "",
    },
  });
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const createAProject = useMutation(api.project.createAProject);

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      const projectId = await createAProject({
        name: data.name,
        status: data.status,
        startDate: data.startDate ? data.startDate.getTime() : undefined,
        endDate: data.endDate ? data.endDate.getTime() : undefined,
        description: data.description,
        color: data.color,
      });

      if (projectId !== undefined) {
        toast({
          title: "🚀 Successfully created a project!",
          duration: 3000,
        });
        form.reset({
          name: "",
          status: "planning",
          description: "",
          color: "",
        });
        router.push(`/loggedin/projects/${projectId}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "❌ Error creating project",
        description: "Please try again",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">
          Create New Project
        </DialogTitle>
        <DialogDescription className="text-base text-muted-foreground">
          Give your project a name to get started organizing your tasks.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter project name..."
                    required
                    disabled={isLoading}
                    className="h-12 text-base border-2 focus:border-primary transition-colors"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter project description..."
                    disabled={isLoading}
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={field.value || "#3b82f6"}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isLoading}
                      className="w-16 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      placeholder="#3b82f6"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isLoading}
                      className="flex-1"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
