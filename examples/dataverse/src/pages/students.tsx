import { useMemo, useRef, useState } from "react"
import type { Siero_courses } from "@/generated/models/Siero_coursesModel"
import type { Siero_students } from "@/generated/models/Siero_studentsModel"
import type { Siero_subjects } from "@/generated/models/Siero_subjectsModel"
import { useAllCourses } from "@/hooks/use-course"
import { getSubjectsByStudentId, useAddSubjectToStudent, useAllSubjects } from "@/hooks/use-subject"
import { useAllStudents, useCreateStudent, useSaveStudentWithSubjects } from "@/hooks/use-student"
import { Check, ChevronDown, GraduationCap, Plus, UserRound, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useT } from "@/lib/i18n"

type Subject = {
  subjectid: string 
  subjectname: string
}

type Course = {
  courseid: string 
  coursename: string
}

export type StudentForm = {
  firstName: string
  lastName: string
  courseid: string | null
  subjects: Siero_subjects[]
}

const EMPTY_FORM: StudentForm = {
  firstName: "",
  lastName: "",
  courseid: null,
  subjects: [],
}

const toCourseOption = (course: Siero_courses): Course => ({
  courseid: course.siero_courseid,
  coursename: course.siero_name,
})

const toSubjectOption = (subject: Siero_subjects): Subject => ({
  subjectid: subject.siero_subjectid,
  subjectname: subject.siero_name,
})

export default function StudentsPage() {
  const { t } = useT()
  const { students, loadingStudents } = useAllStudents()
  const { courses, loadingCourses } = useAllCourses()
  const { subjects, loadingSubjects } = useAllSubjects()
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const activeStudentRequestRef = useRef<string | null>(null)
  const [form, setForm] = useState<StudentForm>(EMPTY_FORM)
  const createStudentMutation = useCreateStudent()
  const saveStudentWithSubjectsMutation = useSaveStudentWithSubjects()
  const addSubjectToStudentMutation = useAddSubjectToStudent()
  const [loadingStudentSubjects, setLoadingStudentSubjects] = useState(false)

  const courseOptions = useMemo(() => (courses ?? []).map(toCourseOption), [courses])
  const subjectOptions = useMemo(() => (subjects ?? []).map(toSubjectOption), [subjects])

  const openStudentDialog = async (student: Siero_students) => {
    const studentId = student.siero_studentid
    activeStudentRequestRef.current = studentId

    setDialogMode("edit")
    setSelectedStudentId(studentId)
    setLoadingStudentSubjects(true)
    setForm({
      firstName: student.siero_firstname ?? "",
      lastName: student.siero_lastname ?? "",
      courseid: student._siero_courseid_value!,
      subjects: [],
    })

    try {
      const initialSubjects = await getSubjectsByStudentId(studentId)
      if (activeStudentRequestRef.current !== studentId) {
        return
      }

      setForm((previous) => ({
        ...previous,
        subjects: initialSubjects,
      }))
    } catch {
      if (activeStudentRequestRef.current === studentId) {
        toast.error("Error loading student subjects")
      }
    } finally {
      if (activeStudentRequestRef.current === studentId) {
        setLoadingStudentSubjects(false)
      }
    }
  }

  const openCreateStudentDialog = () => {
    activeStudentRequestRef.current = null
    setDialogMode("create")
    setSelectedStudentId(null)
    setLoadingStudentSubjects(false)
    setForm(EMPTY_FORM)
  }

  const closeDialog = () => {
    activeStudentRequestRef.current = null
    setDialogMode(null)
    setSelectedStudentId(null)
    setLoadingStudentSubjects(false)
    setForm(EMPTY_FORM)
  }

  const toggleSubject = (subject: Siero_subjects) => {
    setForm((previous) => {
      const exists = previous.subjects.some((item) => item.siero_subjectid === subject.siero_subjectid)
      return {
        ...previous,
        subjects: exists
          ? previous.subjects.filter((item) => item.siero_subjectid !== subject.siero_subjectid)
          : [...previous.subjects, subject],
      }
    })
  }

  const saveStudent = async () => {
    try {
      if (dialogMode === "create") {
        const createdStudent = await createStudentMutation.mutateAsync({ form })
        const createdStudentId = createdStudent?.siero_studentid

        if (createdStudentId && form.subjects.length > 0) {
          await Promise.all(
            form.subjects
              .map((subject) => subject.siero_subjectid)
              .filter((subjectId): subjectId is string => Boolean(subjectId))
              .map((subjectId) =>
                addSubjectToStudentMutation.mutateAsync({
                  studentId: createdStudentId,
                  subjectId,
                })
              )
          )
        }

        toast.success(t.students.toastCreated)
        closeDialog()
        return
      }

      if (!selectedStudentId) {
        return
      }

      await saveStudentWithSubjectsMutation.mutateAsync({
        id: selectedStudentId,
        form,
      })

      toast.success(t.students.toastSaved)
      closeDialog()
    } catch {
      toast.error(dialogMode === "create" ? "Error creating student" : "Error updating student")
    }
  }

  const isFormValid =
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    Boolean(form.courseid) &&
    form.subjects.length > 0

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-6 md:px-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{t.students.heading}</h1>
          <p className="text-sm text-muted-foreground">{t.students.description}</p>
        </div>

        <div>
          <Button onClick={openCreateStudentDialog}>
            <Plus className="h-4 w-4" />
            {t.students.addButton}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(students ?? []).map((student) => (
            <Card
              key={student.siero_studentid}
              role="button"
              tabIndex={0}
              onClick={() => openStudentDialog(student)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  openStudentDialog(student)
                }
              }}
              className="cursor-pointer transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-primary" />
                  {`${student.siero_firstname} ${student.siero_lastname}`}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {student.siero_courseidname}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{t.students.openDetailHint}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog
        open={dialogMode !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeDialog()
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {dialogMode && (
            <>
              <DialogHeader>
                <DialogTitle>{dialogMode === "create" ? t.students.createTitle : t.students.detailTitle}</DialogTitle>
                <DialogDescription>
                  {dialogMode === "create" ? t.students.createDescription : t.students.detailDescription}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="first-name">{t.students.firstNameLabel}</Label>
                    <Input
                      id="first-name"
                      value={form.firstName}
                      onChange={(event) => setForm((previous) => ({ ...previous, firstName: event.target.value }))}
                      placeholder={t.students.firstNamePlaceholder}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last-name">{t.students.lastNameLabel}</Label>
                    <Input
                      id="last-name"
                      value={form.lastName}
                      onChange={(event) => setForm((previous) => ({ ...previous, lastName: event.target.value }))}
                      placeholder={t.students.lastNamePlaceholder}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>{t.students.courseLabel}</Label>
                  <Select
                    value={form.courseid ?? ""}
                    onValueChange={(value) => {
                      const selectedCourse = courseOptions.find((course) => course.courseid === value) ?? null
                      setForm((previous) => ({ ...previous, courseid: selectedCourse?.courseid ?? null }))
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t.students.coursePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {courseOptions.map((course) => (
                        <SelectItem key={course.courseid} value={course.courseid!}>
                          {course.coursename}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>{t.students.subjectsLabel}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between" disabled={loadingStudentSubjects}>
                        <span>
                          {form.subjects.length > 0
                            ? `${form.subjects.length} ${t.students.selectedSubjectsCount}`
                            : t.students.subjectsPlaceholder}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-72">
                      <DropdownMenuLabel>{t.students.subjectsMenuTitle}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {subjectOptions.map((subject) => (
                        <DropdownMenuCheckboxItem
                          key={subject.subjectid}
                          checked={form.subjects.some((item) => item.siero_subjectid === subject.subjectid)}
                          onCheckedChange={() => {
                            const selectedSubject =
                              (subjects ?? []).find((item) => item.siero_subjectid === subject.subjectid) ?? null
                            if (!selectedSubject) {
                              return
                            }
                            toggleSubject(selectedSubject)
                          }}
                        >
                          {subject.subjectname}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.subjects.length === 0 && (
                      <p className="text-xs text-muted-foreground">{t.students.noSubjectsSelected}</p>
                    )}
                    {form.subjects.map((subject) => (
                      <Badge key={subject.siero_subjectid} variant="secondary" className="h-6 gap-1 pr-1">
                        {subject.siero_name}
                        <button
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10"
                          aria-label={`${t.students.removeSubjectLabel}: ${subject.siero_name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button variant="outline" onClick={closeDialog}>
                  {t.common.cancel}
                </Button>
                <Button
                  onClick={saveStudent}
                  disabled={
                    !isFormValid ||
                    saveStudentWithSubjectsMutation.isPending ||
                    createStudentMutation.isPending ||
                    addSubjectToStudentMutation.isPending
                  }
                >
                  <Check className="h-4 w-4" />
                  {t.common.save}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {(loadingStudents || loadingCourses || loadingSubjects) && (
        <div className="px-6 pb-6 text-sm text-muted-foreground md:px-8">
          Loading Dataverse data...
        </div>
      )}
    </div>
  )
}