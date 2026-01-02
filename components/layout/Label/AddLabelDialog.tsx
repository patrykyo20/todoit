"use client";
import { FC, useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  Input,
  Button,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface LabelFormData {
  name: string;
}

const AddLabelDialog: FC = () => {
  const addLabelMutation = useMutation(api.label.createALabel);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<LabelFormData>({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit: SubmitHandler<LabelFormData> = async ({ name }) => {
    if (!name.trim()) {
      toast({
        title: "❌ Error",
        description: "Label name cannot be empty",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const labelId: Id<"labels"> | null = await addLabelMutation({ name: name.trim() });

      if (labelId !== null) {
        form.reset();
        toast({
          title: "😎 Successfully created a Label!",
          description: "Your label has been created.",
          duration: 5000,
        });
        router.push(`/loggedin/filter-labels/${labelId}`);
      } else {
        toast({
          title: "❌ Error",
          description: "Failed to create label. Please try again.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error creating label:", error);
      toast({
        title: "❌ Error",
        description: "An error occurred while creating the label.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-xl lg:h-56 flex flex-col md:flex-row lg:justify-between text-right">
      <DialogHeader className="w-full">
        <DialogTitle>Add a Label</DialogTitle>
        <DialogDescription className="capitalize">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 border-2 p-6 border-gray-200 my-2 rounded-sm "
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Label name"
                        required
                        className="border-0 font-semibold text-lg"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              ></FormField>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Add"
                )}
              </Button>
            </form>
          </Form>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  );
};

export default AddLabelDialog;
