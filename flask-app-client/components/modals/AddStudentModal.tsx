"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import StudentForm, { StudentFormValues } from "@/components/forms/StudentForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api from "@/constants/api";

export default function AddStudentModal() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: StudentFormValues) => {
      const formData = new FormData();
      formData.append("fname", values.fname);
      formData.append("lname", values.lname);
      formData.append("course", values.course);
      formData.append("year", values.year.toString());
      
      if (values.profile_image instanceof File) {
        formData.append("profile_image", values.profile_image);
      }

      const response = await fetch(`${api.base_url}/student/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add student");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student"] });
      toast.success("Student added successfully");
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const onSubmit = (values: StudentFormValues) => {
    mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="size-4" />
        Add Student
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new student to the directory.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <StudentForm onSubmit={onSubmit} isLoading={isPending} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
