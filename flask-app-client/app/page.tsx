"use client";

import Student from "@/types/Student";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import AddStudentModal from "@/components/modals/AddStudentModal";
import EditStudentModal from "@/components/modals/EditStudentModal";
import DeleteStudentModal from "@/components/modals/DeleteStudentModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import api from "@/constants/api";

export default function Home() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["student"],
    queryFn: async (): Promise<Student[]> => {
      const res = await fetch(
        `${api.base_url}/student/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.json();
    }
  });

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center p-24 text-lg">
        Loading...
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center p-24 text-lg text-destructive">
        Error: {error ? (error as any).message : "Unknown error"}
      </main>
    );
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Directory</h1>
            <p className="text-muted-foreground">
              Manage and view student information.
            </p>
          </div>
          <AddStudentModal />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[80px]">Photo</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>
                    <Avatar className="size-10">
                      <AvatarImage src={`${api.base_url}/${student.profile_image}`} />
                      <AvatarFallback><User className="size-6" /></AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{student.fname}</TableCell>
                  <TableCell>{student.lname}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>{student.year}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditStudentModal student={student} />
                      <DeleteStudentModal student={student} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}