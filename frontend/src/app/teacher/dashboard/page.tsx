// src/app/teacher/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import { useSelectedSemesterId } from "@/features/semesters/hooks/useSelectedSemesterId";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { useClassrooms } from "@/features/classrooms/hooks/useClassrooms";
import { CourseResponse } from "@/types/payloads";
import NameEditorModal from "@/components/modals/NameEditorModal";
import TopBar from "@/features/teacher/layout/TopBar";

export default function TeacherDashboardPage() {
  const { loading: authLoading } = useAuthGuard("teacher");

  // ✅ 正确解构学期 ID（只读）
  const [semesterId] = useSelectedSemesterId();

  const {
    courses,
    loading: coursesLoading,
    addCourse,
    editCourse,
    removeCourse,
  } = useCourses(semesterId);

  const [activeCourseId, setActiveCourseId] = useState<string>("");

  const { classrooms, addClassroom, editClassroom, removeClassroom } =
    useClassrooms(activeCourseId);

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(
    null
  );

  const [showClassModal, setShowClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ✅ 课程变化时自动选中第一个课程
  useEffect(() => {
    if (courses.length > 0) {
      setActiveCourseId(courses[0]._id);
    } else {
      setActiveCourseId("");
    }
  }, [courses]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <TopBar />

      {/* 内容区域 */}
      <main className="px-6 py-8">
        {!semesterId && (
          <div className="text-gray-500 text-center py-20">
            暂无可用学期，请先在右上角添加学期
          </div>
        )}

        {semesterId && !authLoading && !coursesLoading && (
          <>
            {/* 课程 Tabs */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {courses.map((course) => (
                <div key={course._id} className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveCourseId(course._id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCourseId === course._id
                        ? "bg-blue-600 text-white shadow"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {course.name}
                  </button>
                  <button
                    onClick={() => {
                      setEditingCourse(course);
                      setShowEditCourseModal(true);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    🖉
                  </button>
                </div>
              ))}
              {/* ✅ 一直显示添加按钮 */}
              <button
                onClick={() => setShowCourseModal(true)}
                disabled={!semesterId}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  semesterId
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-white cursor-not-allowed"
                }`}
              >
                + 添加课程
              </button>
            </div>

            {/* 班级卡片 */}
            {courses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {classrooms.map((cls) => (
                  <div
                    key={cls._id}
                    className="relative bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => {
                          setEditingClass({ id: cls._id, name: cls.name });
                          setShowEditClassModal(true);
                        }}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                      >
                        ⋮
                      </button>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {cls.name}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      点击进入作业 / 考试管理
                    </p>
                  </div>
                ))}
                <div
                  onClick={() => {
                    if (!activeCourseId) return;
                    setShowClassModal(true);
                  }}
                  className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition ${
                    activeCourseId
                      ? "bg-gray-100 hover:bg-gray-200 border-gray-300"
                      : "bg-gray-100 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-2xl font-bold text-gray-500">＋</div>
                  <div className="text-sm text-gray-600 mt-2">新建班级</div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {/* 添加课程 */}
      {showCourseModal && (
        <NameEditorModal
          title="添加课程"
          type="课程"
          onSave={async (val) => {
            const newCourse = await addCourse(val);
            if (newCourse?._id) {
              setActiveCourseId(newCourse._id);
            }
          }}
          onClose={() => setShowCourseModal(false)}
        />
      )}

      {/* 编辑课程 */}
      {showEditCourseModal && editingCourse && (
        <NameEditorModal
          title="编辑课程"
          type="课程"
          initialValue={editingCourse.name}
          onSave={(val) => editCourse(editingCourse._id, val)}
          onDelete={async () => {
            await removeCourse(editingCourse._id);
            const next = courses.find((c) => c._id !== editingCourse._id);
            setActiveCourseId(next?._id || "");
          }}
          confirmDeleteText="确定要删除该课程吗？此操作将删除该课程下的所有班级，且无法恢复"
          onClose={() => setShowEditCourseModal(false)}
        />
      )}

      {/* 添加班级 */}
      {showClassModal && (
        <NameEditorModal
          title="添加班级"
          type="班级"
          onSave={(val) => addClassroom(val)}
          onClose={() => setShowClassModal(false)}
        />
      )}

      {/* 编辑班级 */}
      {showEditClassModal && editingClass && (
        <NameEditorModal
          title="编辑班级"
          type="班级"
          initialValue={editingClass.name}
          onSave={(val) => editClassroom(editingClass.id, val)}
          onDelete={() => removeClassroom(editingClass.id)}
          confirmDeleteText="确定要删除该班级吗？此操作将删除该班级下的所有考试与作业，且无法恢复"
          onClose={() => setShowEditClassModal(false)}
        />
      )}
    </div>
  );
}
