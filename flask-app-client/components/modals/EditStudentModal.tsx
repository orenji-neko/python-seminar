"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
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
import Student from "@/types/Student";
import api from "@/constants/api";

interface EditStudentModalProps {
  student: Student;
}

export default function EditStudentModal({ student }: EditStudentModalProps) {
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

      const response = await fetch(`${api.base_url}/student/${student.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update student");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student"] });
      toast.success("Student updated successfully");
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
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Pencil className="size-4" />
        <span className="sr-only">Edit Student</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update the details for {student.fname} {student.lname}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <StudentForm 
            initialData={student} 
            onSubmit={onSubmit} 
            isLoading={isPending} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
