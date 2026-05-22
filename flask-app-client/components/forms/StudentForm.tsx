"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Student from "@/types/Student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courses } from "@/constants/course";
import { Loader2, User } from "lucide-react";
import CameraComponent from "@/components/ui/camera";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/constants/api";

const studentSchema = z.object({
  lname: z.string().min(1, "Last name is required"),
  fname: z.string().min(1, "First name is required"),
  course: z.string().min(1, "Course is required"),
  year: z.number().min(1, "Year must be at least 1").max(5, "Year cannot exceed 5"),
  profile_image: z.any().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  initialData?: Partial<Student>;
  onSubmit: (data: StudentFormValues) => void;
  isLoading?: boolean;
}

export default function StudentForm({ initialData, onSubmit, isLoading }: StudentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      lname: initialData?.lname || "",
      fname: initialData?.fname || "",
      course: initialData?.course || "",
      year: initialData?.year || 1,
      profile_image: initialData?.profile_image || null,
    },
  });

  const profileImage = watch("profile_image");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profileImage instanceof File) {
      const url = URL.createObjectURL(profileImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof profileImage === "string") {
      setPreviewUrl(`${api.base_url}/${profileImage}`);
    } else {
      setPreviewUrl(null);
    }
  }, [profileImage]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="flex flex-col items-center gap-4 mb-4">
        {previewUrl ? (
          <div className="relative group">
            <Avatar className="size-24 border-2 border-primary">
              <AvatarImage src={previewUrl} />
              <AvatarFallback><User className="size-12" /></AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                type="button" 
                variant="ghost" 
                className="text-white hover:text-white"
                onClick={() => {
                  setValue("profile_image", null);
                  setPreviewUrl(null);
                }}
              >
                Change
              </Button>
            </div>
          </div>
        ) : (
          <Field>
            <FieldLabel>Profile Image</FieldLabel>
            <FieldContent>
              <CameraComponent onCapture={(file) => setValue("profile_image", file)} />
            </FieldContent>
          </Field>
        )}
      </div>

      <Field>
        <FieldLabel>First Name</FieldLabel>
        <FieldContent>
          <Input
            {...register("fname")}
            placeholder="Enter first name"
            disabled={isLoading}
            autoComplete="given-name"
          />
        </FieldContent>
        <FieldError errors={[errors.fname]} />
      </Field>

      <Field>
        <FieldLabel>Last Name</FieldLabel>
        <FieldContent>
          <Input
            {...register("lname")}
            placeholder="Enter last name"
            disabled={isLoading}
            autoComplete="family-name"
          />
        </FieldContent>
        <FieldError errors={[errors.lname]} />
      </Field>

      <Field>
        <FieldLabel>Course</FieldLabel>
        <FieldContent>
          <Controller
            name="course"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.code} value={course.code}>
                      {course.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FieldContent>
        <FieldError errors={[errors.course]} />
      </Field>

      <Field>
        <FieldLabel>Year</FieldLabel>
        <FieldContent>
          <Input
            {...register("year", { valueAsNumber: true })}
            type="number"
            placeholder="Enter year level"
            disabled={isLoading}
            min={1}
            max={5}
          />
        </FieldContent>
        <FieldError errors={[errors.year]} />
      </Field>

      <Button type="submit" disabled={isLoading} className="mt-2 text-white">
        {isLoading && <Loader2 className="animate-spin" />}
        {initialData ? "Update Student" : "Add Student"}
      </Button>
    </form>
  );
}
