// app/teacher/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import EditorModal from "@/components/modals/NameEditorModal";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import TopBar from "@/features/teacher/layout/TopBar";

type Course = { id: string; name: string };

export default function TeacherDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, loading } = useAuthGuard("teacher");
  const [semesters, setSemesters] = useState(["2025春季", "2024秋季"]);
  const [selectedSemester, setSelectedSemester] = useState("2025春季");

  const [mockCourses, setMockCourses] = useState<Course[]>([
    { id: "course-1", name: "软件工程" },
    { id: "course-2", name: "算法设计" },
    { id: "course-3", name: "Web开发" },
  ]);

  const [mockClassrooms, setMockClassrooms] = useState<Record<string, string[]>>({
    "course-1": ["软工2201", "软工2202"],
    "course-2": ["算法2101"],
    "course-3": ["前端2201", "前端2202", "前端2203"],
  });

  const [activeCourseId, setActiveCourseId] = useState(mockCourses[0].id);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [showClassModal, setShowClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<{ courseId: string; name: string } | null>(null);

  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showSemesterEditModal, setShowSemesterEditModal] = useState(false);

  // 恢复上次选中的课程
  useEffect(() => {
    const saved = localStorage.getItem("activeCourse");
    if (saved && mockCourses.find((c) => c.id === saved)) {
      setActiveCourseId(saved);
    }
  }, [mockCourses]);

  // 保存当前课程
  useEffect(() => {
    localStorage.setItem("activeCourse", activeCourseId);
  }, [activeCourseId]);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <TopBar />

      {/* 内容区域 */}
      <main className="px-6 py-8">
        {/* 课程 Tabs */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {mockCourses.map((course) => (
            <div key={course.id} className="flex items-center space-x-1">
              <button
                onClick={() => setActiveCourseId(course.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCourseId === course.id
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
          <button
            onClick={() => setShowCourseModal(true)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition"
          >
            + 添加课程
          </button>
        </div>

        {/* 班级卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {(mockClassrooms[activeCourseId] || []).map((className: string) => (
            <div key={className} className="relative bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer">
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => {
                    setEditingClass({ courseId: activeCourseId, name: className });
                    setShowEditClassModal(true);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ⋮
                </button>
              </div>
              <div className="text-lg font-semibold text-gray-900">{className}</div>
              <p className="text-sm text-gray-500 mt-1">点击进入作业 / 考试管理</p>
            </div>
          ))}
          <div
            onClick={() => setShowClassModal(true)}
            className="bg-gray-100 hover:bg-gray-200 p-6 rounded-2xl border-2 border-dashed border-gray-300 text-center cursor-pointer transition"
          >
            <div className="text-2xl font-bold text-gray-500">＋</div>
            <div className="text-sm text-gray-600 mt-2">新建班级</div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCourseModal && (
        <EditorModal
          title="添加课程"
          type="课程"
          onSave={(val) => {
            const id = `course-${Date.now()}`;
            setMockCourses([...mockCourses, { id, name: val }]);
            setActiveCourseId(id);
            setMockClassrooms({ ...mockClassrooms, [id]: [] });
          }}
          onClose={() => setShowCourseModal(false)}
        />
      )}

      {showEditCourseModal && editingCourse && (
        <EditorModal
          title="编辑课程"
          type="课程"
          initialValue={editingCourse.name}
          onSave={(val) => {
            setMockCourses((prev) =>
              prev.map((c) => (c.id === editingCourse.id ? { ...c, name: val } : c))
            );
          }}
          onDelete={() => {
            setMockCourses((prev) =>
              prev.filter((c) => c.id !== editingCourse.id)
            );
            setActiveCourseId(mockCourses[0]?.id || "");
          }}
          onClose={() => setShowEditCourseModal(false)}
        />
      )}

      {showClassModal && (
        <EditorModal
          title="添加班级"
          type="班级"
          onSave={(val) => {
            const updated = [...(mockClassrooms[activeCourseId] || []), val];
            setMockClassrooms({ ...mockClassrooms, [activeCourseId]: updated });
          }}
          onClose={() => setShowClassModal(false)}
        />
      )}

      {showEditClassModal && editingClass && (
        <EditorModal
          title="编辑班级"
          type="班级"
          initialValue={editingClass.name}
          onSave={(val) => {
            const updated = (mockClassrooms[editingClass.courseId] || []).map((n) =>
              n === editingClass.name ? val : n
            );
            setMockClassrooms({
              ...mockClassrooms,
              [editingClass.courseId]: updated,
            });
          }}
          onDelete={() => {
            const filtered = (mockClassrooms[editingClass.courseId] || []).filter(
              (n) => n !== editingClass.name
            );
            setMockClassrooms({
              ...mockClassrooms,
              [editingClass.courseId]: filtered,
            });
          }}
          onClose={() => setShowEditClassModal(false)}
        />
      )}

      {showSemesterModal && (
        <EditorModal
          title="添加学期"
          type="学期"
          onSave={(val) => {
            setSemesters((prev) => [...prev, val]);
            setSelectedSemester(val);
          }}
          onClose={() => setShowSemesterModal(false)}
        />
      )}

      {showSemesterEditModal && (
        <EditorModal
          title="编辑学期"
          type="学期"
          initialValue={selectedSemester}
          onSave={(val) => {
            setSemesters((prev) =>
              prev.map((s) => (s === selectedSemester ? val : s))
            );
            setSelectedSemester(val);
          }}
          onDelete={() => {
            setSemesters((prev) => prev.filter((s) => s !== selectedSemester));
            setSelectedSemester(semesters[0] || "");
          }}
          onClose={() => setShowSemesterEditModal(false)}
        />
      )}
    </div>
  );
}


